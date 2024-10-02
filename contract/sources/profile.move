module aptos_social::profile {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::table::{Self, Table};
    use aptos_std::debug;

    use aptos_framework::event;
    use aptos_framework::timestamp;

    use aptos_social::utils;
    friend aptos_social::feeds;

    // Error codes
    const ERROR_INVALID_STRING: u64 = 0;
    const ERROR_UNAUTHORISED_ACCESS: u64 = 1;
    const ERROR_DUPLICATE_RESOURCE: u64 = 2;
    const ERROR_NOT_FOUND: u64 = 3;
    const ERROR_INVALID_PRICE: u64 = 4;
    const ERROR_PROCESS_FAILED: u64 = 5;

    struct Recommendation has copy, drop {
        addr: address,
        score: u64,
    }

    struct UserInteraction has copy, drop, store {
        user_id: address,
        followed_user_id: address,
        interaction_strength: u64,
    }

    // Profile structure
    struct Creator has key, store, copy, drop {
        name: String,
        username: String,
        wallet: address,
        email: String,
        pfp: String,
        banner: String,
        bio: String,
        website: String,
        profile_uri: String,
        created_at: u64,
        updated_at: u64,
        followers: vector<address>,
        following: vector<address>,
        is_verified: bool,
    }

    struct AptosSocialProfileState has key {
        creator_count: u64,
        transaction_count: u64,
        creators: Table<address, Creator>,
        usernames: Table<String, address>,
        creator_addresses: vector<address>,
        admin_addr: address,
        pending_admin_addr: Option<address>,
        user_interactions: Table<address, vector<UserInteraction>>,
    }

    #[event]
    struct NewCreatorEvent has drop, store {
        creator: address,
        display_name: string::String,
        username: string::String,
    }

    /// If you deploy the module under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        let account_addr = signer::address_of(sender);
        assert!(!exists<AptosSocialProfileState>(account_addr), ERROR_DUPLICATE_RESOURCE);

        let state = AptosSocialProfileState {
            creator_count: 0,
            transaction_count: 0,
            creators: table::new(),
            usernames: table::new(),
            creator_addresses: vector::empty(),
            admin_addr: signer::address_of(sender),
            pending_admin_addr: option::none(),
            user_interactions: table::new(),
        };

        move_to(sender, state);
    }

    // Register a new creator
    public entry fun register_creator(
        creator: &signer,
        name: String,
        username: String,
        email: String,
        pfp: String
    ) acquires AptosSocialProfileState {
        let creator_address = signer::address_of(creator);
        let state = borrow_global_mut<AptosSocialProfileState>(@aptos_social);
        let lowercase_username = utils::to_lowercase(&username);
        
        assert!(!table::contains(&state.creators, creator_address), ERROR_DUPLICATE_RESOURCE); // ERROR_DUPLICATE_RESOURCE
        assert!(!table::contains(&state.usernames, lowercase_username), ERROR_DUPLICATE_RESOURCE); // ERROR_DUPLICATE_RESOURCE
        assert!(string::length(&name) > 0 && string::length(&username) > 0 && string::length(&pfp) > 0, ERROR_INVALID_STRING); // ERROR_INVALID_STRING

        let new_creator = Creator {
            name: name,
            username: lowercase_username,
            wallet: creator_address,
            email: email,
            pfp: pfp,
            banner: string::utf8(b""),
            bio: string::utf8(b""),
            website: string::utf8(b""),
            profile_uri: string::utf8(b""),
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
            followers: vector::empty(),
            following: vector::empty(),
            is_verified: false,
        };

        table::add(&mut state.creators, creator_address, new_creator);
        table::add(&mut state.usernames, lowercase_username, creator_address);
        vector::push_back(&mut state.creator_addresses, creator_address);
        state.creator_count = state.creator_count + 1;

        // Emit event
        event::emit(NewCreatorEvent {
            creator: creator_address,
            display_name: name,
            username: lowercase_username,
        });
    }

    // Update creator information
    public entry fun update_creator(
        creator: &signer,
        name: String,
        username: String,
        email: String,
        pfp: String,
        banner: String,
        bio: String,
        website: String
    ) acquires AptosSocialProfileState {
        let creator_address = signer::address_of(creator);
        let state = borrow_global_mut<AptosSocialProfileState>(@aptos_social);
        let lowercase_username = utils::to_lowercase(&username);

        assert!(table::contains(&state.creators, creator_address), ERROR_NOT_FOUND);
        assert!(string::length(&name) > 0 && string::length(&username) > 0, ERROR_INVALID_STRING); // ERROR_INVALID_STRING

        let creator = table::borrow_mut(&mut state.creators, creator_address);

        if(!utils::is_same_string(creator.username, username)) {
            assert!(!table::contains(&state.usernames, lowercase_username), ERROR_DUPLICATE_RESOURCE);
            // Remove old username mapping and add new one
            table::remove(&mut state.usernames, creator.username);
            table::add(&mut state.usernames, lowercase_username, creator_address);
            creator.username = lowercase_username;
        };

        creator.name = name;
        creator.pfp = pfp;
        creator.banner = banner;
        creator.email = email;
        creator.bio = bio;
        creator.website = website;
        creator.updated_at = timestamp::now_seconds();
    }

    public fun follow(
        creator: &signer,
        friend_address: address
    ) acquires AptosSocialProfileState {
        let creator_address = signer::address_of(creator);
        let state = borrow_global_mut<AptosSocialProfileState>(@aptos_social);

        // Check if users exists
        assert!(table::contains(&state.creators, creator_address), ERROR_NOT_FOUND);
        assert!(table::contains(&state.creators, friend_address), ERROR_NOT_FOUND);
        
        // Add friend to following list
        let creator_ref = table::borrow_mut(&mut state.creators, creator_address);
        vector::push_back(&mut creator_ref.following, friend_address);
    }

    public fun unfollow(
        creator: &signer,
        friend_address: address
    ) acquires AptosSocialProfileState {
        let creator_address = signer::address_of(creator);
        let state = borrow_global_mut<AptosSocialProfileState>(@aptos_social);

        // Check if users exists
        assert!(table::contains(&state.creators, creator_address), ERROR_NOT_FOUND);
        assert!(table::contains(&state.creators, friend_address), ERROR_NOT_FOUND);

        // Remove friend from following list
        let creator_ref = table::borrow_mut(&mut state.creators, creator_address);
        let (is_found, index) = vector::index_of(&creator_ref.following, &friend_address);
        assert!(is_found, ERROR_PROCESS_FAILED);
        vector::remove(&mut creator_ref.following, index);
    }

    public fun log_user_interaction(
        account: &signer,
        followed_user_id: address,
        interaction_strength: u64
    ) acquires AptosSocialProfileState {
        let user_id = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialProfileState>(@aptos_social);
        
        let interaction = UserInteraction {
            user_id,
            followed_user_id,
            interaction_strength
        };
        
        if (!table::contains(&state.user_interactions, user_id)) {
            let interactions = vector::empty<UserInteraction>();
            vector::push_back(&mut interactions, interaction);
            table::add(&mut state.user_interactions, user_id, interactions);
        } else {
            let interactions = *table::borrow_mut(&mut state.user_interactions, user_id);
            vector::push_back(&mut interactions, interaction);
            table::upsert(&mut state.user_interactions, user_id, interactions);
        }
    }

    inline fun sort_by_value(scores: &mut vector<Recommendation>) {
        let length = vector::length(scores);
        let i = 1;
        while (i < length) {
            let j = i;
            while (j > 0) {
                let minus = *vector::borrow(scores, j - 1);
                let suggestion = *vector::borrow(scores, j);

                if (minus.score < suggestion.score) {
                    // Swap
                    let temp = Recommendation {
                        addr: minus.addr,
                        score: minus.score,
                    };
                    *vector::borrow_mut(scores, j - 1) = Recommendation {
                        addr: suggestion.addr,
                        score: suggestion.score,
                    };
                    *vector::borrow_mut(scores, j) = temp;
                } else {
                    break; // No need to continue if the order is correct
                };
                j = j - 1;
            };
            i = i + 1;
        }
    }

    #[view]
    public fun recommend_users_to_follow(
        account_addr: address
    ): vector<address> acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social);

        // Step 1: Get interactions for the user
        let interactions = if (table::contains(&state.user_interactions, account_addr)) {
            *table::borrow(&state.user_interactions, account_addr)
        } else {
            vector::empty<UserInteraction>()
        };

        // Step 2: Create a vector to track follow suggestions and their scores
        let suggestion_scores = vector::empty<Recommendation>();

        // Step 3: Process each interaction
        let length = vector::length(&interactions);
        let i = 0;
        while (i < length) {
            let interaction = *vector::borrow(&interactions, i);
            let followed_user_id = interaction.followed_user_id;

            // Step 4: Retrieve the following list of this followed user
            let followed_creator = table::borrow(&state.creators, followed_user_id);
            let followed_creator_following = &followed_creator.following;

            // Step 5: Score suggestions based on mutual following and interaction strength
            let followed_len = vector::length(followed_creator_following);
            let j = 0;
            while (j < followed_len) {
                let potential_follow = *vector::borrow(followed_creator_following, j);

                // Skip if the user is already following this person
                let user_creator = table::borrow(&state.creators, account_addr);
                if (!vector::contains(&followed_creator.followers, &potential_follow)) {
                    // Step 6: Check if the potential follow is already in suggestion_scores
                    let score_found = false;
                    let existing_score = 0;
                    let index = 0;

                    while (index < vector::length(&suggestion_scores)) {
                        let existing_recommendation = *vector::borrow(&suggestion_scores, index);
                        if (existing_recommendation.addr == potential_follow) {
                            // If found, update the score
                            existing_score = existing_recommendation.score;
                            score_found = true;
                            break;
                        };
                        index = index + 1;
                    };

                    // If not found, add a new entry
                    if (score_found) {
                        let updated_score = existing_score + interaction.interaction_strength;
                    
                        // Update the score by removing the old entry and inserting the new one
                        let updated_recommendation = Recommendation {
                            addr: potential_follow,
                            score: updated_score,
                        };
                        vector::remove(&mut suggestion_scores, index);
                        vector::push_back(&mut suggestion_scores, updated_recommendation);
                    } else {
                        vector::push_back(&mut suggestion_scores, Recommendation {
                            addr: potential_follow,
                            score: interaction.interaction_strength
                        });
                    }
                };

                j = j + 1;
            };

            i = i + 1;
        };

        // Step 6: Fallback: If no recommendations from interactions, suggest users with enough followers and trending content
        if (vector::is_empty(&suggestion_scores)) {
            let creator_addresses = &state.creator_addresses;
            let total_creators = vector::length(creator_addresses);
            let creator = table::borrow(&state.creators, account_addr);

            let k = 0;
            while (k < total_creators) {
                let potential_follow = *vector::borrow(creator_addresses, k);
                
                // Ensure we don't recommend already followed users
                if (!vector::contains(&creator.following, &potential_follow) && potential_follow != account_addr) {
                    let potential_creator = table::borrow(&state.creators, potential_follow);
                    
                    // Calculate score based on follower count and trending content
                    let follower_count = vector::length(&potential_creator.followers);
                    // let trending_content_score = get_trending_content_score(potential_follow);
                    
                    let total_score = follower_count; //+ trending_content_score; // Simple additive score, can be weighted
                    
                    vector::push_back(&mut suggestion_scores, Recommendation {
                        addr: potential_follow,
                        score: total_score,
                    });
                };

                k = k + 1;
            }
        };

        // Step 7: Sort the recommendations based on score
        sort_by_value(&mut suggestion_scores);

        // Step 8: Extract the addresses from the sorted suggestion_scores
        let sorted_recommendations = vector::empty<address>();
        let suggestion_length = vector::length(&suggestion_scores);
        let k = 0;
        while (k < suggestion_length) {
            let suggestion = *vector::borrow(&suggestion_scores, k);
            vector::push_back(&mut sorted_recommendations, suggestion.addr);
            k = k + 1;
        };

        // Step 9: Return the sorted recommendations
        sorted_recommendations
    }

    #[view]
    public fun profile_exists(creator: address): bool acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social);
        table::contains(&state.creators, creator)
    }

    #[view]
    public fun is_name_taken(username: String): bool acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social);
        let lowercase_username = utils::to_lowercase(&username);
        table::contains(&state.usernames, lowercase_username)
    }

    // Retrieve a creator's profile by address
    #[view]
    public fun find_creator(creator_address: address): Creator acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social);
        *table::borrow(&state.creators, creator_address)
    }

    // Retrieve a creator's profile by username
    #[view]
    public fun find_creator_by_name(username: String): Creator acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social);
        let lower_username = utils::to_lowercase(&username);

        assert!(table::contains(&state.usernames, lower_username), ERROR_NOT_FOUND);

        let creator_address = table::borrow(&state.usernames, lower_username);
        *table::borrow(&state.creators, *creator_address)
    }

    #[view]
    public(friend) fun username_to_address(username: String): address acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social);
        let lower_username = utils::to_lowercase(&username);

        assert!(table::contains(&state.usernames, lower_username), ERROR_NOT_FOUND);

        *table::borrow(&state.usernames, lower_username)
    }

    #[view]
    public fun find_all_creators(): vector<Creator> acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social);

        let creators = vector::empty<Creator>();
        let addresses = &state.creator_addresses;
        let length = vector::length(addresses);

        let i = 0;
        while (i < length) {
            let addr = *vector::borrow(addresses, i);
            let creator = table::borrow(&state.creators, addr);
            vector::push_back(&mut creators, *creator);
            i = i + 1;
        };

        creators
    }

    #[view]
    public fun get_interactions(account_addr: address): vector<UserInteraction> acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social);
        let interactions = *table::borrow(&state.user_interactions, account_addr);
        interactions
    }

    #[test_only]
    /// Get all registered Creators
    public entry fun verify_creator_exists(creator_address: address): bool acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social);
        table::contains(&state.creators, creator_address)
    }

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}