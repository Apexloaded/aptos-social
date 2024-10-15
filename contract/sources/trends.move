module aptos_social::trends {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;

    use aptos_std::debug;

    use aptos_framework::timestamp; 

    friend aptos_social::feeds;

    const ERROR_DUPLICATE_RESOURCE: u64 = 2;

    struct TrendView has drop, copy{
        keyword: String,
        decayed_frequency: u64,
    }

    struct Trends has store, copy, drop {
        word: String,
        frequency: u64,
        updated_at: u64,
    }

    // Resource to store hashtags and keywords with timestamps and frequency
    struct KeywordStore has store {
        hashtags: vector<Trends>, // (hashtag, frequency, last_updated_timestamp)
        keywords: vector<Trends>  // (keyword, frequency, last_updated_timestamp)
    }

    // Event for logging when hashtags or keywords are updated
    #[event]
    struct KeywordUpdateEvent has copy, drop, store {
        updated_hashtag: String,
        updated_keyword: String,
    }

    // Resource Account for keeping the keyword store
    struct AptosSocialTrendState has key {
        keyword_store: KeywordStore,
    }

    // Initialize the KeywordStore in the account
    fun init_module(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<AptosSocialTrendState>(account_addr), ERROR_DUPLICATE_RESOURCE);

        let state = AptosSocialTrendState {
            keyword_store: KeywordStore {
                hashtags: vector::empty(),
                keywords: vector::empty(),
            }
        };
        move_to(account, state);
    }

    // Helper function to increment or add a hashtag with timestamp in the store
    fun increment_or_add(vec: &mut vector<Trends>, item: String, current_time: u64) {
        let found = false;
        let len = vector::length(vec);
        let i = 0;
        while (i < len) {
            let trend = vector::borrow_mut<Trends>(vec, i);
            if (trend.word == item) {
                trend.frequency = trend.frequency + 1;
                trend.updated_at = current_time; // Update the timestamp to the current time
                found = true;
                break
            };
            i = i + 1;
        };

        if (!found) {
            vector::push_back(vec, Trends {
                word: item,
                frequency: 1,
                updated_at: current_time
            }); // New tag/keyword with current timestamp
        }
    }

    // Apply time decay to a given frequency based on the time difference
    fun apply_time_decay(frequency: u64, last_updated: u64, current_time: u64): u64 {
        let time_difference = current_time - last_updated;
        let decay_rate: u64 = 86400; // Decay over one day (86400 seconds for 24 hours)
        let decay_factor = if (time_difference < decay_rate) { 1 } else { time_difference / decay_rate };
        let decayed_frequency = frequency / decay_factor;

        let time_decay = if (decayed_frequency < 3) { 0 } else { decayed_frequency };
        
        time_decay
    }

    // Main function to process posts with hashtags and keywords
    public(friend) fun update_trending(
        hashtags: vector<String>,
        keywords: vector<String>
    ) acquires AptosSocialTrendState {
        let store_keeper = borrow_global_mut<AptosSocialTrendState>(@aptos_social);
        let keyword_store = &mut store_keeper.keyword_store;
        let current_time = timestamp::now_seconds(); // Get current timestamp

        // Update hashtags
        if (!vector::is_empty(&hashtags)) {
            let len = vector::length(&hashtags);
            let i = 0;
            while (i < len) {
                let tag = vector::borrow(&hashtags, i);
                increment_or_add(&mut keyword_store.hashtags, *tag, current_time);
                i = i + 1;
            };
        };


        // Update keywords
        if (!vector::is_empty(&keywords)) {
            let len_kw = vector::length(&keywords);
            let j = 0;
            while (j < len_kw) {
                let word = vector::borrow(&keywords, j);
                increment_or_add(&mut keyword_store.keywords, *word, current_time);
                j = j + 1;
            }
        }
    }

    // Calculate trending score for hashtags and keywords using time decay and frequency
    fun calculate_trending_score(vec: &vector<Trends>, current_time: u64): vector<TrendView> {
        let len = vector::length(vec);
        let trending = vector::empty<TrendView>();
        let i = 0;
        while (i < len) {
            let trends = vector::borrow<Trends>(vec, i);
            let decayed_frequency = apply_time_decay(trends.frequency, trends.updated_at, current_time);
            
            if(decayed_frequency > 0) { // 5 is the min threshold of a trending keyword
                vector::push_back(&mut trending, TrendView {
                    keyword: trends.word,
                    decayed_frequency
                });
            };
            i = i + 1;
        };
        trending
    }

    fun sort_by_decayed_frequency(trending: &mut vector<TrendView>) {
        let len = vector::length(trending);
        
        if (len == 0) {
            return // No need to sort if the vector is empty
        };

        let swapped = true;

        // Use a flag to determine if a swap occurred
        while (swapped) {
            swapped = false;  // Reset swapped to false at the start of each iteration

            let i = 0;
            while (i < len - 1) {
                let current = vector::borrow(trending, i);
                let next = vector::borrow(trending, i + 1);

                if (current.decayed_frequency < next.decayed_frequency) {
                    // Swap elements if next has a higher decayed_frequency
                    let temp = *current;
                    *vector::borrow_mut(trending, i) = *next;
                    *vector::borrow_mut(trending, i + 1) = temp;

                    // Mark that a swap has happened
                    swapped = true;
                };
                i = i + 1;
            }
        }
    }

    // Retrieve and rank top trending hashtags
    #[view]
    public fun get_trending_hashtags(): vector<TrendView> acquires AptosSocialTrendState {
        let store_keeper = borrow_global<AptosSocialTrendState>(@aptos_social);
        let current_time = timestamp::now_seconds();
        let trending = calculate_trending_score(&store_keeper.keyword_store.hashtags, current_time);
        sort_by_decayed_frequency(&mut trending);
        trending
    }

    // Retrieve and rank top trending keywords
    #[view]
    public fun get_trending_keywords(): vector<TrendView> acquires AptosSocialTrendState {
        let store_keeper = borrow_global<AptosSocialTrendState>(@aptos_social);
        let current_time = timestamp::now_seconds();
        calculate_trending_score(&store_keeper.keyword_store.keywords, current_time)
    }

    #[test(account = @aptos_social, aptos_framework = @0x1)]
    public fun test_increment_hashtags(account: &signer, aptos_framework: &signer) acquires AptosSocialTrendState {
        init_module_for_test(account);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        // Add the first hashtag
        let hashtags = vector::empty<String>();
        vector::push_back(&mut hashtags, string::utf8(b"bitcoin"));
        vector::push_back(&mut hashtags, string::utf8(b"bitcoin"));
        vector::push_back(&mut hashtags, string::utf8(b"bitcoin"));
        update_trending(hashtags, vector::empty<String>());

        // Check if #bitcoin was added with frequency 1
        let trending_hashtags = get_trending_hashtags();
        let bitcoin = vector::borrow(&trending_hashtags, 0);
        assert!(bitcoin.keyword == string::utf8(b"bitcoin"), 1);
        assert!(bitcoin.decayed_frequency == 3, 2);

        // Add the same hashtag again
        let hashtags = vector::empty<String>();
        vector::push_back(&mut hashtags, string::utf8(b"bitcoin"));
        vector::push_back(&mut hashtags, string::utf8(b"bitcoin"));
        update_trending(hashtags, vector::empty<String>());

        // Check if #bitcoin frequency is incremented to 2
        let trending_hashtags = get_trending_hashtags();
        let bitcoin = vector::borrow(&trending_hashtags, 0);
        assert!(bitcoin.keyword == string::utf8(b"bitcoin"), 3);
        assert!(bitcoin.decayed_frequency == 5, 4);
    }

    #[test]
    public fun test_sort_by_decayed_frequency() {
        let trending_keywords = vector::empty<TrendView>();

        // Create mock TrendView data with different decayed frequencies
        let keyword1 = TrendView {
            keyword: string::utf8(b"crypto"),
            decayed_frequency: 10
        };
        let keyword2 = TrendView {
            keyword: string::utf8(b"bitcoin"),
            decayed_frequency: 50
        };
        let keyword3 = TrendView {
            keyword: string::utf8(b"nft"),
            decayed_frequency: 30
        };
        let keyword4 = TrendView {
            keyword: string::utf8(b"blockchain"),
            decayed_frequency: 5
        };

        // Add keywords to vector
        vector::push_back(&mut trending_keywords, keyword1);
        vector::push_back(&mut trending_keywords, keyword2);
        vector::push_back(&mut trending_keywords, keyword3);
        vector::push_back(&mut trending_keywords, keyword4);

        // Sort by decayed frequency
        sort_by_decayed_frequency(&mut trending_keywords);

        // Ensure that the keywords are sorted in descending order by decayed frequency
        let first = *vector::borrow(&trending_keywords, 0);
        let second = *vector::borrow(&trending_keywords, 1);
        let third = *vector::borrow(&trending_keywords, 2);
        let fourth = *vector::borrow(&trending_keywords, 3);

        // The order should be: bitcoin (50), nft (30), crypto (10), blockchain (5)
        assert!(first.keyword == string::utf8(b"bitcoin"), 100);
        assert!(second.keyword == string::utf8(b"nft"), 101);
        assert!(third.keyword == string::utf8(b"crypto"), 102);
        assert!(fourth.keyword == string::utf8(b"blockchain"), 103);

        // Debugging for clarity (optional, but helpful in complex tests)
        // debug::print(&first.keyword);
        // debug::print(&second.keyword);
        // debug::print(&third.keyword);
        // debug::print(&fourth.keyword);
    }

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}
