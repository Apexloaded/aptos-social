module aptos_social_host::aptos_social_feeds {
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
    use aptos_framework::object::{Self, Object, ObjectCore, ExtendRef};
    use aptos_framework::timestamp;

    use aptos_token_objects::collection::{Self, Collection, MutatorRef};
    use aptos_token_objects::royalty::{Self, Royalty};
    use aptos_token_objects::token::{Self, Token};

    use minter::token_components;
    use minter::mint_stage;
    use minter::collection_components;

    use aptos_social_host::aptos_social_utils;
    use aptos_social_host::aptos_social_profile::{Self, Creator};

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
        collector: address,
        tip_count: u64,
        media: vector<Media>,
        metadata_uri: String,
        token_obj: Object<Token>,
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
        tips: vector<Tips>,
        post_comments: Table<u64, vector<Post>>,
        admin_addr: address,
        pending_admin_addr: Option<address>,
        collections: vector<Object<Collection>>,
        custom_collection_name: Table<String, Object<Collection>>,
    }

    #[event]
    struct PostCreatedEvent has drop, store {
        post_id: u64,
        author: address,
        timestamp: u64,
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

    #[event]
    struct CollectionCreatedEvent has drop, store {
        creator_addr: address,
        collection_owner_obj: Object<CollectionAccessConfig>,
        collection_obj: Object<Collection>,
        max_supply: u64,
        name: String,
        description: String,
        uri: String,
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
        assert!(aptos_social_profile::profile_exists(creator_address), ERROR_UNAUTHORISED_ACCESS);
        
        let id = aptos_social_utils::to_lowercase(&custom_id);
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

        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
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

        event::emit(CollectionCreatedEvent {
            creator_addr: creator_address,
            collection_owner_obj,
            collection_obj,
            max_supply,
            name,
            description,
            uri
        });
    }

    public entry fun mint_post(
        account: &signer,
        content: String,
        price: u64,
        media_urls: vector<String>,
        media_mimetypes: vector<String>,
        metadata_uri: String,
        collection_obj: Object<Collection>,
    ) acquires AptosSocialFeedState, CollectionConfig, CollectionAccessConfig {
        let creator_address = signer::address_of(account);
        assert!(string::length(&content) > 0, ERROR_INVALID_STRING);

        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));
        let access_config_obj = collection_config.collection_access_config;
        let access_config = borrow_global<CollectionAccessConfig>(
            object::object_address(&access_config_obj)
        );
        
        assert!(aptos_social_profile::profile_exists(creator_address), ERROR_UNAUTHORISED_ACCESS);
        assert!(access_config.creator == creator_address, ERROR_UNAUTHORISED_ACCESS);

        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
        let post_id = state.post_count + 1;
        
        let hashtags = aptos_social_utils::extract_hashtags(&content);

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

        let nft_obj = mint_nft_internal(creator_address, collection_obj, metadata_uri);
        let post = Post {
            id: post_id,
            author: creator_address,
            content,
            price,
            collector: @0x0,
            tip_count: 0,
            media,
            metadata_uri,
            token_obj: nft_obj,
            created_at: timestamp::now_seconds(),
            is_collectible: true,
            liked_by: vector::empty(),
            parent_id: 0,
            hashtag: hashtags,
            comment_count: 0,
            is_comment: false,
            upvotes: vector::empty(),
            downvotes: vector::empty(),
            hidden: false,
            featured: false
        };

        vector::push_back(&mut state.posts, post);
        table::add(&mut state.post_item, post_id, post);
        state.post_count = post_id;

        // Emit post created event
        event::emit(PostCreatedEvent {
            post_id,
            author: creator_address,
            timestamp: timestamp::now_seconds(),
        });
    }

    public entry fun add_comment(
        account: &signer,
        pid: u64,
        comment: String
    ) acquires AptosSocialFeedState {
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
        assert!(table::contains(&state.post_item, pid), ERROR_NOT_FOUND);
        assert!(aptos_social_profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);
        assert!(string::length(&comment) > 0, ERROR_INVALID_STRING);

        let post_id = state.post_count + 1;

        let parent_post = table::borrow_mut(&mut state.post_item, pid);
        parent_post.comment_count = parent_post.comment_count + 1;

        let hashtags = aptos_social_utils::extract_hashtags(&comment);
        let child_post = Post {
            id: post_id,
            author: sender_address,
            content: comment,
            price: 0,
            collector: @0x0,
            tip_count: 0,
            media: vector::empty<Media>(),
            metadata_uri: string::utf8(b""),
            token_obj: parent_post.token_obj,
            created_at: timestamp::now_seconds(),
            is_collectible: true,
            liked_by: vector::empty(),
            parent_id: pid,
            hashtag: hashtags,
            comment_count: 0,
            is_comment: true,
            upvotes: vector::empty(),
            downvotes: vector::empty(),
            hidden: false,
            featured: false
        };

        // Add the child post to the global state
        vector::push_back(&mut state.posts, child_post);
        table::add(&mut state.post_item, post_id, child_post);
        state.post_count = post_id;

        // Update the post_comments table
        if(!table::contains(&state.post_comments, pid)) {
            let new_comment = vector::empty<Post>();
            vector::push_back(&mut new_comment, child_post);
            table::add(&mut state.post_comments,pid, new_comment);
        } else {
            let cc = *table::borrow_mut(&mut state.post_comments, pid);
            vector::push_back(&mut cc, child_post);
            table::upsert(&mut state.post_comments, pid, cc);
        };

        // Emit post created event
        event::emit(PostCreatedEvent {
            post_id,
            author: sender_address,
            timestamp: timestamp::now_seconds(),
        });
    }

    public entry fun like(account: &signer, post_id: u64) acquires AptosSocialFeedState {
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(aptos_social_profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);
        
        let post = table::borrow_mut(&mut state.post_item, post_id);

        assert!(!vector::contains(&post.liked_by, &sender_address), ERROR_DUPLICATE_RESOURCE);
        vector::push_back(&mut post.liked_by, sender_address);
    }

    public entry fun unlike(account: &signer, post_id: u64) acquires AptosSocialFeedState {
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(aptos_social_profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);

        let post = table::borrow_mut(&mut state.post_item, post_id);
        let (is_found, index) = vector::index_of(&post.liked_by, &sender_address);
        assert!(is_found, ERROR_PROCESS_FAILED);

        vector::remove(&mut post.liked_by, index);
    }

    public entry fun collect_post(account: &signer, post_id: u64) acquires AptosSocialFeedState {
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(aptos_social_profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);
    }

    public entry fun upvote_post(account: &signer, post_id: u64) acquires AptosSocialFeedState { 
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(aptos_social_profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);
        
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
        }
    }

    public entry fun downvote_post(account: &signer, post_id: u64) acquires AptosSocialFeedState { 
        let sender_address = signer::address_of(account);
        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
        assert!(table::contains(&state.post_item, post_id), ERROR_NOT_FOUND);
        assert!(aptos_social_profile::profile_exists(sender_address), ERROR_UNAUTHORISED_ACCESS);
        
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
        }
    }

    /****************************************************************
     * APTOS SOCIAL FEED INTERNAL FUNCTIONS
     ****************************************************************/
    
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
        let creator = aptos_social_profile::find_creator(post.author);
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


    /****************************************************************
     * APTOS SOCIAL FEED VIEW FUNCTIONS
     ****************************************************************/

    #[view]
    /// Get all collections created using this contract
    public fun get_global_collections(): vector<Object<Collection>> acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social_host);
        state.collections
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
    public fun list_all_posts(): vector<PostItem> acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social_host);
        let posts_array = state.posts;
        let posts = vector::empty<PostItem>();
        let length = vector::length(&posts_array);
        let i = 0;
        while (i < length) {
            let post = *table::borrow(&state.post_item, i+1);
            if(post.is_comment == false) {
                let post_item = generate_post_data(post);
                vector::push_back(&mut posts, post_item);
            };
            i = i + 1;
        };
        posts
    }

    #[view]
    public fun get_post_by_id(post_id: u64): PostItem acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social_host);
        let post = *table::borrow(&state.post_item, post_id);
        generate_post_data(post)
    }

    #[view]
    public fun get_comments(post_id: u64): vector<PostItem> acquires AptosSocialFeedState {
        let state = borrow_global<AptosSocialFeedState>(@aptos_social_host);
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