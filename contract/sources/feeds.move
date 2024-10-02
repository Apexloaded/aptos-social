module aptos_social::feeds {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::table::{Self, Table};
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_std::string_utils;
    use aptos_std::debug;

    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::object::{Self, Object, ObjectCore, ExtendRef};
    use aptos_framework::timestamp;
    use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata, FungibleAsset};
    use aptos_framework::primary_fungible_store;

    use aptos_token_objects::collection::{Self, Collection, MutatorRef};
    use aptos_token_objects::royalty::{Self, Royalty};
    use aptos_token_objects::token::{Self, Token};

    use minter::token_components;
    use minter::mint_stage;
    use minter::collection_components;

    use aptos_social::utils;
    use aptos_social::events;
    use aptos_social::listing::{Self, Listing};
    use aptos_social::profile::{Self, Creator};
    use aptos_social::trends;

    // Error codes
    const ERROR_INVALID_STRING: u64 = 0;
    const ERROR_UNAUTHORISED_ACCESS: u64 = 1;
    const ERROR_DUPLICATE_RESOURCE: u64 = 2;
    const ERROR_NOT_FOUND: u64 = 3;
    const ERROR_INVALID_PRICE: u64 = 4;
    const ERROR_PROCESS_FAILED: u64 = 5;

    struct Media has copy, drop, store {
        url: String,
        mimetype: String,
    }

    struct PostItem has key, store, drop {
        creator: Creator,
        post: Post,
    }
    // Post structure
    struct Post has store, copy, drop {
        id: u64,
        author: address,
        content: String,
        price: u64,
        owner: address,
        collector: address,
        tip_count: u64,
        media: vector<Media>,
        metadata_uri: String,
        created_at: u64,
        is_collectible: bool,
        liked_by: vector<address>,
        parent_id: u64,
        hashtag: vector<String>,
        comment_count: u64,
        is_comment: bool,
        upvotes: vector<address>,
        downvotes: vector<address>,
        hidden: bool,
        featured: bool,
    }

    struct PostListing has key, store, drop, copy {
        listing: Object<Listing>
    }

    struct Tips has store {
        post_id: u64,
        tip_sent: u64,
        tip_received: u64,
        from: address,
        to: address,
        message: vector<u8>,
        timestamp: u64,
        token_address: address,
    }

    struct CollectionMetadata has key, drop, copy {
        created_at: u64,
        logo_img: String,
        banner_img: String,
        featured_img: String,
        custom_id: String,
        website: String,
        is_default: bool,
        collection_address: address,
        mint_fee_per_nft_by_stages: SimpleMap<String, u64>,
        mint_enabled: bool,
    }

    struct CollectionAccessConfig has key {
        collection: Object<Collection>,
        extend_ref: object::ExtendRef,
        transfer_ref: object::TransferRef,
        mutator_ref: MutatorRef,
        creator: address,
    }

    struct CollectionConfig has key {
        collection_access_config: Object<CollectionAccessConfig>,
        extend_ref: object::ExtendRef,
    }

    struct UserCollections has key {
        collections: vector<Object<Collection>>
    }

    struct AptosSocialFeedState has key {
        post_count: u64,
        tips_count: u64,
        posts: vector<Post>,
        post_item: Table<u64, Post>,
        post_listing: Table<u64, PostListing>,
        tips: vector<Tips>,
        post_comments: Table<u64, vector<Post>>,
        admin_addr: address,
        pending_admin_addr: Option<address>,
        collections: vector<Object<Collection>>,
        custom_collection_name: Table<String, Object<Collection>>,
    }

    #[event]
    struct PostRemintedEvent has drop, store {
        post_id: u64,
        reminter: address,
        timestamp: u64,
    }

    #[event]
    struct TipSentEvent has drop, store {
        tip_id: u64,
        from: address,
        to: address,
        amount: u64,
        timestamp: u64,
    }

    /// If you deploy the module under your own account, sender is your account's signer
    fun init_module(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<AptosSocialFeedState>(account_addr), ERROR_DUPLICATE_RESOURCE);

        let state = AptosSocialFeedState {
            post_count: 0,
            tips_count: 0,
            posts: vector::empty(),
            post_item: table::new(),
            post_listing: table::new(),
            tips: vector::empty(),
            post_comments: table::new(),
            admin_addr: signer::address_of(account),
            pending_admin_addr: option::none(),
            collections: vector::empty(),
            custom_collection_name: table::new()
        };

        move_to(account, state);
    }

    public entry fun create_collection(
        account: &signer,
        name: String,
        description: String,
        max_supply: u64,
        custom_id: String,
        royalty_percentage: Option<u64>,
        logo_img: Option<String>,
        banner_img: Option<String>,
        featured_img: Option<String>,
    ) acquires AptosSocialFeedState, UserCollections {
        let creator_address = signer::address_of(account);
        assert!(profile::profile_exists(creator_address), ERROR_UNAUTHORISED_ACCESS);
        
        let id = utils::to_lowercase(&custom_id);
        let royalty = royalty(&mut royalty_percentage, creator_address);

        let owner_constructor_ref = &object::create_object(creator_address);
        let owner_obj_signer = &object::generate_signer(owner_constructor_ref);

        let collections = get_global_collections();
        let collection_id = vector::length(&collections) + 1;
        let uri = string::utf8(b"https://aptos.social/collections/");
        string::append(&mut uri, id);

        let collection_constructor_ref = 
            &collection::create_fixed_collection(
                owner_obj_signer,
                description,
                max_supply,
                name,
                royalty,
                uri,
            );
        let collection_obj_signer = &object::generate_signer(collection_constructor_ref);
        let collection_obj = object::object_from_constructor_ref(collection_constructor_ref);

        collection_components::create_refs_and_properties(collection_constructor_ref);

        if (!exists<UserCollections>(creator_address)) {
            move_to(account, UserCollections { collections: vector::empty<Object<Collection>>() });
        };
        let user_collections = borrow_global_mut<UserCollections>(creator_address);
        vector::push_back(&mut user_collections.collections, collection_obj);

        move_to(owner_obj_signer, CollectionAccessConfig {
            extend_ref: object::generate_extend_ref(owner_constructor_ref),
            transfer_ref: object::generate_transfer_ref(collection_constructor_ref),
            mutator_ref: collection::generate_mutator_ref(collection_constructor_ref),
            collection: collection_obj,
            creator: creator_address
        });

        let collection_owner_obj = object::object_from_constructor_ref(owner_constructor_ref);
        move_to(collection_obj_signer, CollectionConfig {
            extend_ref: object::generate_extend_ref(collection_constructor_ref),
            collection_access_config: collection_owner_obj,
        });

        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social);
        vector::push_back(&mut state.collections, collection_obj);
        table::add(&mut state.custom_collection_name, id, collection_obj);
        store_collection_metadata(
            collection_obj_signer,
            creator_address,
            uri,
            id,
            logo_img,
            banner_img,
            featured_img,
            object::object_address(&collection_obj)
        );

        events::emit_collection_created<Collection>(
            creator_address,
            collection_obj,
            max_supply,
            name,
            description,
            uri
        )
    }

    public entry fun mint_post(
        account: &signer,
        content: String,
        price: u64,
        media_urls: vector<String>,
        media_mimetypes: vector<String>,
        metadata_uri: String,
        collection_obj: Object<Collection>,
        is_nft_post: bool
    ) acquires AptosSocialFeedState, CollectionConfig, CollectionAccessConfig {
        let creator_address = signer::address_of(account);
        assert!(string::length(&content) > 0, ERROR_INVALID_STRING);

        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));
        let access_config_obj = collection_config.collection_access_config;
        let access_config = borrow_global<CollectionAccessConfig>(
            object::object_address(&access_config_obj)
        );
        
        assert!(profile::profile_exists(creator_address), ERROR_UNAUTHORISED_ACCESS);
        assert!(access_config.creator == creator_address, ERROR_UNAUTHORISED_ACCESS);

        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social);
        let post_id = state.post_count + 1;
        
        let hashtags = utils::extract_hashtags(&content);

        let media = vector::empty<Media>();
        let media_length = vector::length(&media_urls);
        let i = 0;
        while (i < media_length) {
            let url = *vector::borrow(&media_urls, i);
            let mimetype = *vector::borrow(&media_mimetypes, i);
            let media_item = create_media(url, mimetype);
            vector::push_back(&mut media, media_item);
            i = i + 1;
        };

        let is_collectible = false;
        if(media_length > 0) {
            is_collectible = is_nft_post;
        } else {
            is_collectible = false;
        };

        if (is_collectible) {
            let nft = option::some(
                mint_nft_internal(creator_address, collection_obj, metadata_uri)
            );
            let token_obj = *option::borrow(&nft);
            let (_, constructor_ref) = listing::init(account, token_obj, timestamp::now_seconds());
            let listing = object::object_from_constructor_ref(&constructor_ref);
            table::add(&mut state.post_listing, post_id, PostListing { listing });
        };

        let post = store_post(
            state,
            post_id,
            creator_address,
            content,
            price,
            media,
            metadata_uri,
            is_collectible,
            0,
            hashtags,
            false
        );

        if(vector::length(&hashtags) > 0) {
            trends::update_trending(account, hashtags, vector::empty<String>());
        };

        // Emit post created event
        events::emit_post_created(
            post_id,
            creator_address,
            timestamp::now_seconds()
        );
    }

    public entry fun add_comment(
        account: &signer,
        pid: u64,
        comment: String
    ) acquires AptosSocialFeedState {
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social);
        assert!(table::contains(&state.post_item, pid), ERROR_NOT_FOUND);
        assert!(profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);
        assert!(string::length(&comment) > 0, ERROR_INVALID_STRING);

        let comment_id = state.post_count + 1;

        let parent_post = table::borrow_mut(&mut state.post_item, pid);
        parent_post.comment_count = parent_post.comment_count + 1;
        profile::log_user_interaction(account, parent_post.author, 4);

        let hashtags = utils::extract_hashtags(&comment);

        let post = store_post(
            state,
            comment_id,
            sender_address,
            comment,
            0,
            vector::empty<Media>(),
            string::utf8(b""),
            false,
            pid,
            hashtags,
            true
        );

        if(vector::length(&hashtags) > 0) {
            trends::update_trending(account, hashtags, vector::empty<String>());
        };

        // Update the post_comments table
        if(!table::contains(&state.post_comments, pid)) {
            let new_comment = vector::empty<Post>();
            vector::push_back(&mut new_comment, post);
            table::add(&mut state.post_comments, pid, new_comment);
        } else {
            let cc = *table::borrow_mut(&mut state.post_comments, pid);
            vector::push_back(&mut cc, post);
            table::upsert(&mut state.post_comments, pid, cc);
        };

        // Emit post created event
        events::emit_comment_added(
            comment_id,
            pid,
            sender_address,
            timestamp::now_seconds(),
        );
    }

    public entry fun like(account: &signer, post_id: u64) acquires AptosSocialFeedState {
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);
        
        let post = table::borrow_mut(&mut state.post_item, post_id);

        assert!(!vector::contains(&post.liked_by, &sender_address), ERROR_DUPLICATE_RESOURCE);
        vector::push_back(&mut post.liked_by, sender_address);
        profile::log_user_interaction(account, post.author, 1);
    }

    public entry fun unlike(account: &signer, post_id: u64) acquires AptosSocialFeedState {
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);

        let post = table::borrow_mut(&mut state.post_item, post_id);
        let (is_found, index) = vector::index_of(&post.liked_by, &sender_address);
        assert!(is_found, ERROR_PROCESS_FAILED);

        vector::remove(&mut post.liked_by, index);
    }

    public entry fun collect_post<CoinType>(account: &signer, post_id: u64) acquires AptosSocialFeedState {
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);

        let post = table::borrow_mut(&mut state.post_item, post_id);
        let post_listing = *table::borrow_mut(&mut state.post_listing, post_id);

        assert!(post.is_collectible, ERROR_PROCESS_FAILED);

        let coins = coin::withdraw<CoinType>(account, post.price);
        let price = coin::value<CoinType>(&coins);
        let (royalty_addr, royalty_charge) = listing::calculate_royalty(post_listing.listing, price);
        let seller = listing::close(account, post_listing.listing, sender_address);
        post.collector = sender_address;
        post.owner = sender_address;
        post.is_collectible = false;
        table::remove(&mut state.post_listing, post_id);

        if (royalty_charge != 0) {
            let royalty = coin::extract(&mut coins, royalty_charge);
            aptos_account::deposit_coins(royalty_addr, royalty);
        };

        aptos_account::deposit_coins(seller, coins);

        profile::log_user_interaction(account, post.author, 10);
        events::emit_listing_filled(
            object::object_address(&post_listing.listing),
            seller,
            sender_address,
            price,
            royalty_charge
        )
    }

    public entry fun upvote_post(account: &signer, post_id: u64) acquires AptosSocialFeedState { 
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);
        
        let post = table::borrow_mut(&mut state.post_item, post_id);

        // If user has already downvoted, remove the downvote
        let (downvoted, downvote_index) = vector::index_of(&post.downvotes, &sender_address);
        if (downvoted) {
            vector::remove(&mut post.downvotes, downvote_index);
        };

        // Ensure the user hasn't already upvoted
        let (upvoted, _) = vector::index_of(&post.upvotes, &sender_address);
        assert!(!upvoted, ERROR_DUPLICATE_RESOURCE);

        // Add the user's address to the upvotes list
        vector::push_back(&mut post.upvotes, sender_address);

        let upvotes = vector::length(&post.upvotes);
        let (upvote_threshold, _) = calculate_threshold(post);
        if (upvotes >= upvote_threshold) {
            post.featured = true;
            post.hidden = false;
        };

        profile::log_user_interaction(account, post.author, 2);
    }

    public entry fun downvote_post(account: &signer, post_id: u64) acquires AptosSocialFeedState { 
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);
        
        let post = table::borrow_mut(&mut state.post_item, post_id);

        // If user has already upvoted, remove the downvote
        let (upvoted, upvote_index) = vector::index_of(&post.upvotes, &sender_address);
        if (upvoted) {
            vector::remove(&mut post.upvotes, upvote_index);
        };

        // Ensure the user hasn't already downvoted
        let (downvoted, _) = vector::index_of(&post.downvotes, &sender_address);
        assert!(!downvoted, ERROR_DUPLICATE_RESOURCE);

        // Add the user's address to the downvotes list
        vector::push_back(&mut post.downvotes, sender_address);

        let downvotes = vector::length(&post.downvotes);
        let (_, downvote_threshold) = calculate_threshold(post);
        if (downvotes >= downvote_threshold) {
            post.hidden = true;
            post.featured = false;
        };
        
        profile::log_user_interaction(account, post.author, 0 - 1);
    }

    /****************************************************************
     * APTOS SOCIAL FEED INTERNAL FUNCTIONS
     ****************************************************************/

    inline fun store_post(
        state: &mut AptosSocialFeedState,
        post_id: u64,
        creator_address: address,
        content: String,
        price: u64,
        media: vector<Media>,
        metadata_uri: String,
        is_collectible: bool,
        parent_id: u64,
        hashtags: vector<String>,
        is_comment: bool
    ): Post {
        let post = Post {
            id: post_id,
            author: creator_address,
            owner: creator_address,
            content,
            price,
            collector: @0x0,
            tip_count: 0,
            media,
            metadata_uri,
            created_at: timestamp::now_seconds(),
            is_collectible,
            liked_by: vector::empty(),
            parent_id: 0,
            hashtag: hashtags,
            comment_count: 0,
            is_comment,
            upvotes: vector::empty(),
            downvotes: vector::empty(),
            hidden: false,
            featured: false
        };

        // let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social);
        vector::push_back(&mut state.posts, post);
        table::add(&mut state.post_item, post_id, post);
        state.post_count = post_id;

        post
    }
    
    // Store NFT Metadata to storage
    inline fun store_collection_metadata(
        col_obj_signer: &signer,
        creator_address: address,
        uri: String,
        custom_id: String,
        logo_img: Option<String>,
        banner_img: Option<String>,
        featured_img: Option<String>,
        collection_address: address
    ) acquires CollectionMetadata {
        let logo = string::utf8(b"");
        if(option::is_some(&logo_img)) {
            logo = *option::borrow(&logo_img);
        };

        let banner = string::utf8(b"");
        if(option::is_some(&banner_img)) {
            banner = *option::borrow(&banner_img);
        };

        let featured = string::utf8(b"");
        if(option::is_some(&featured_img)) {
            featured = *option::borrow(&featured_img);
        };

        let is_default = true;
        let state = borrow_global<UserCollections>(creator_address);
        if(vector::length(&state.collections) > 1 ) {
            is_default = false;
        };

        debug::print<bool>(&is_default);
        move_to(col_obj_signer, CollectionMetadata {
            created_at: timestamp::now_seconds(),
            logo_img: logo,
            custom_id,
            banner_img: banner,
            featured_img: featured,
            website: uri,
            is_default,
            collection_address,
            mint_fee_per_nft_by_stages: simple_map::new(),
            mint_enabled: true,
        });
    }

    inline fun mint_nft_internal(
        creator_address: address,
        collection_obj: Object<Collection>,
        metadata_uri: String,
    ): Object<Token> acquires CollectionConfig, CollectionAccessConfig {
        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));

        let collection_owner_obj = collection_config.collection_access_config;
        let collection_owner_config = borrow_global<CollectionAccessConfig>(
            object::object_address(&collection_owner_obj)
        );
        let collection_owner_obj_signer = &object::generate_signer_for_extending(&collection_owner_config.extend_ref);

        let next_nft_id = *option::borrow(&collection::count(collection_obj)) + 1;

        let nft_obj_constructor_ref = &token::create(
            collection_owner_obj_signer,
            collection::name(collection_obj),
            string_utils::to_string(&next_nft_id),
            string_utils::to_string(&next_nft_id),
            royalty::get(collection_obj),
            metadata_uri,
        );
        token_components::create_refs(nft_obj_constructor_ref);
        let nft_obj = object::object_from_constructor_ref(nft_obj_constructor_ref);
        object::transfer(collection_owner_obj_signer, nft_obj, creator_address);

        nft_obj
    }

    inline fun royalty(
        royalty_numerator: &mut Option<u64>,
        creator_address: address,
    ): Option<Royalty> {
        if (option::is_some(royalty_numerator)) {
            let num = option::extract(royalty_numerator);
            option::some(royalty::create(num, 100, creator_address))
        } else {
            option::none()
        }
    }

    inline fun generate_post_data(post: Post): PostItem {
        let creator = profile::find_creator(post.owner);
        PostItem {post, creator}
    }

    inline fun calculate_threshold(
        post: &Post
    ): (u64, u64) {
        let base_upvote_threshold = 50;
        let base_downvote_threshold = 20;

        let upvotes = vector::length(&post.upvotes);
        let downvotes = vector::length(&post.downvotes);
        let post_age = timestamp::now_seconds() - post.created_at;
        let engagement_rate = (upvotes + downvotes) / post_age;

        // Time-based adjustment
        if (post_age > 72 * 60 * 60) { // more than 72 hours
            base_upvote_threshold = base_upvote_threshold * 3;
            base_downvote_threshold = base_downvote_threshold / 2;
        };

        // Engagement rate adjustment
        if (engagement_rate > 1) {
            base_upvote_threshold = base_upvote_threshold / 2; // Easier to feature
            base_downvote_threshold = base_downvote_threshold / 2; // Easier to hide
        };

        (base_upvote_threshold, base_downvote_threshold)
    }

    inline fun calculate_trending_score(post: Post): u64 {
        let upvotes_weight = 3;
        let downvotes_weight = 1;
        let tips_weight = 5;
        let comments_weight = 2; // Weight for comments
        let time_decay_factor = 2; // A factor to reduce the score over time.

        let upvotes = vector::length(&post.upvotes);
        let downvotes = vector::length(&post.downvotes);
        let tips = post.tip_count;
        let comments = post.comment_count;
        
        // The post age in hours (assuming created_at is a timestamp in seconds)
        let post_age_in_hours = (timestamp::now_seconds() - post.created_at) / 3600;

        // Trending score formula incorporating comment count
        let trending_score = ((
            upvotes_weight * upvotes 
            + tips_weight * tips 
            + comments_weight * comments)
            - (downvotes_weight * downvotes))
            / (time_decay_factor * post_age_in_hours + 1);

        trending_score
    }


    /****************************************************************
     * APTOS SOCIAL FEED VIEW FUNCTIONS
     ****************************************************************/

    #[view]
    /// Get all collections created using this contract
    public fun get_global_collections(): vector<Object<Collection>> acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social);
        state.collections
    }

    #[view]
    public fun get_trending_posts(): vector<PostItem> acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social);
        let posts_array = state.posts;
        let posts = vector::empty<PostItem>();
        let length = vector::length(&posts_array);
        let i = 0;
        while (i < length) {
            let post = *table::borrow(&state.post_item, i+1);
            let trending_score = calculate_trending_score(post);

            // Define a threshold for "trending" (e.g., trending score above 50)
            if (trending_score > 50) {
                let post_item = generate_post_data(post);
                vector::push_back(&mut posts, post_item);
            };
            i = i + 1;
        };
        posts
    }

    #[view]
    public fun get_creators_collections(creator_address: address): vector<Object<Collection>> acquires UserCollections {
        let state = borrow_global<UserCollections>(creator_address);
        state.collections
    }

    #[view]
    public fun get_metadata(collection_obj: Object<Collection>): CollectionMetadata acquires CollectionMetadata {
        let object_addr = object::object_address(&collection_obj);
        let metadata_ref = borrow_global<CollectionMetadata>(object_addr);
        let metadata = CollectionMetadata {
            created_at: metadata_ref.created_at,
            logo_img: metadata_ref.logo_img,
            banner_img: metadata_ref.banner_img,
            featured_img: metadata_ref.featured_img,
            custom_id: metadata_ref.custom_id,
            website: metadata_ref.website,
            is_default: metadata_ref.is_default,
            collection_address: metadata_ref.collection_address,
            mint_fee_per_nft_by_stages: metadata_ref.mint_fee_per_nft_by_stages,
            mint_enabled: metadata_ref.mint_enabled,
        };
        metadata
    }

    #[view]
    public fun get_feeds(): vector<PostItem> acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social);
        let posts_array = state.posts;
        let posts = vector::empty<PostItem>();
        let length = vector::length(&posts_array);
        let i = 0;
        while (i < length) {
            let post = *table::borrow(&state.post_item, i+1);
            let downvotes = vector::length(&post.downvotes);
            let (_, downvote_threshold) = calculate_threshold(&post);            
            if(post.is_comment == false && 
                downvotes < downvote_threshold && 
                post.hidden == false
            ) {
                let post_item = generate_post_data(post);
                vector::push_back(&mut posts, post_item);
            };
            i = i + 1;
        };
        posts
    }

    #[view]
    public fun get_post_by_id(post_id: u64): PostItem acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social);
        let post = *table::borrow(&state.post_item, post_id);
        generate_post_data(post)
    }

    #[view]
    public fun get_posts_by_hashtag(hashtag: String): vector<PostItem> acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social);
        let posts_array = state.posts;
        let posts = vector::empty<PostItem>();
        let length = vector::length(&posts_array);
        let i = 0;
        while (i < length) {
            let post = *table::borrow(&state.post_item, i+1);
            let downvotes = vector::length(&post.downvotes);
            let (_, downvote_threshold) = calculate_threshold(&post);  
            let l_hashtag = utils::to_lowercase(&hashtag);         
            if(downvotes < downvote_threshold && 
                post.hidden == false &&
                vector::contains(&post.hashtag, &l_hashtag)
            ) {
                let post_item = generate_post_data(post);
                vector::push_back(&mut posts, post_item);
            };
            i = i + 1;
        };
        posts
    }

    #[view]
    public fun get_owned_posts(username: String): vector<PostItem> acquires AptosSocialFeedState {
        let creator_address = profile::username_to_address(username);
        let state = borrow_global<AptosSocialFeedState>(@aptos_social);
        let posts_array = state.posts;
        let posts = vector::empty<PostItem>();
        let length = vector::length(&posts_array);
        let i = 0;
        while (i < length) {
            let post = *table::borrow(&state.post_item, i+1);
            let downvotes = vector::length(&post.downvotes);
            let (_, downvote_threshold) = calculate_threshold(&post);            
            if(post.owner == creator_address) {
                let post_item = generate_post_data(post);
                vector::push_back(&mut posts, post_item);
            };
            i = i + 1;
        };
        posts
    }

    #[view]
    public fun get_comments(post_id: u64): vector<PostItem> acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social);
        let comment_array = *table::borrow(&state.post_comments, post_id);
        let comments = vector::empty<PostItem>();
        let length = vector::length(&comment_array);
        let i = 0;
        while (i < length) {
            let comment_ref = *vector::borrow(&comment_array, i);
            let comment = *table::borrow(&state.post_item, comment_ref.id);
            let comment_item = generate_post_data(comment);
            vector::push_back(&mut comments, comment_item);
            i = i + 1;
        };
        comments
    }

    #[view]
    public fun create_media(url: String, mimetype: String): Media {
        Media { url, mimetype }
    }

    #[test_only]
    public fun get_likes(id: u64): vector<address> acquires AptosSocialFeedState {
        let postItem = get_post_by_id(id);
        postItem.post.liked_by
    }

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}