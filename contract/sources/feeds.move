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
    use aptos_social_host::aptos_social_profile;

    // Error codes
    const ERROR_INVALID_STRING: u64 = 0;
    const ERROR_UNAUTHORISED_ACCESS: u64 = 1;
    const ERROR_DUPLICATE_RESOURCE: u64 = 2;
    const ERROR_NOT_FOUND: u64 = 3;
    const ERROR_INVALID_PRICE: u64 = 4;
    const ERROR_PROCESS_FAILED: u64 = 5;

    struct Media has copy, drop, store {
        url: vector<u8>,
        mimetype: vector<u8>,
    }

    struct PostCreator has copy, drop, store {
        name: vector<u8>,
        username: vector<u8>,
        pfp: vector<u8>,
    }

    // Post structure
    struct Post has store {
        id: u64,
        author: address,
        content: vector<u8>,
        remint_price: u64, // Optional price
        remint_count: u64,
        reminted_by: vector<address>,
        remint_token: address,
        tip_count: u64,
        media: vector<Media>,
        metadata_uri: vector<u8>,
        token_id: u64,
        created_at: u64,
        is_reminted: bool,
        reminted_post: u64,
        liked_by: vector<address>,
        parent_id: u64,
        hashtag: vector<String>,
        comment_count: u64,
        is_comment: bool, // Used for comments
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

    struct UserCollectionMetadata has key {
        created_at: u64,
        logo_img: Option<String>,
        banner_img: Option<String>,
        featured_img: Option<String>,
        custom_id: String,
        website: String,
        collection_address: address
    }

    struct CollectionAccessConfig has key {
        collection: Object<Collection>,
        extend_ref: object::ExtendRef,
        transfer_ref: object::TransferRef,
        mutator_ref: MutatorRef,
        creator: address,
    }

    struct CollectionConfig has key {
        mint_fee_per_nft_by_stages: SimpleMap<String, u64>,
        mint_enabled: bool,
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
        tips: vector<Tips>,
        post_comments: vector<vector<u64>>,
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
            tips: vector::empty(),
            post_comments: vector::empty(),
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
            mint_fee_per_nft_by_stages: simple_map::new(),
            mint_enabled: true,
            extend_ref: object::generate_extend_ref(collection_constructor_ref),
            collection_access_config: collection_owner_obj,
        });

        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
        vector::push_back(&mut state.collections, collection_obj);
        table::add(&mut state.custom_collection_name, id, collection_obj);
        store_nft_metadata(
            collection_obj_signer,
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
        content: vector<u8>,
        remint_price: u64,
        media_urls: vector<vector<u8>>,
        media_mimetypes: vector<vector<u8>>,
        metadata_uri: vector<u8>,
        collection_obj: Object<Collection>,
    ) acquires AptosSocialFeedState, CollectionConfig, CollectionAccessConfig {
        let creator_address = signer::address_of(account);

        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));
        let access_config_obj = collection_config.collection_access_config;
        let access_config = borrow_global<CollectionAccessConfig>(
            object::object_address(&access_config_obj)
        );
        
        assert!(aptos_social_profile::profile_exists(creator_address), ERROR_UNAUTHORISED_ACCESS);
        assert!(access_config.creator == creator_address, ERROR_UNAUTHORISED_ACCESS);

        let state = borrow_global_mut<AptosSocialFeedState>(@aptos_social_host);
        let post_id = state.post_count + 1;
        
        let stringedContent = string::utf8(content);
        let hashtags = aptos_social_utils::extract_hashtags(&stringedContent);

        let media = vector::empty<Media>();
        let media_length = vector::length(&media_urls);
        let i = 0;
        while (i < media_length) {
            let url = *vector::borrow(&media_urls, i);
            let mimetype = *vector::borrow(&media_mimetypes, i);
            let media_item = Media { url, mimetype };
            vector::push_back(&mut media, media_item);
            i = i + 1;
        };

        let post = Post {
            id: post_id,
            author: creator_address,
            content,
            remint_price,
            remint_count: 0,
            reminted_by: vector::empty(),
            remint_token: @0x0,
            tip_count: 0,
            media,
            metadata_uri,
            token_id: 0, // To be set when minting as NFT
            created_at: timestamp::now_seconds(),
            is_reminted: false,
            reminted_post: 0,
            liked_by: vector::empty(),
            parent_id: 0,
            hashtag: hashtags,
            comment_count: 0,
            is_comment: false,
        };

        vector::push_back(&mut state.posts, post);
        state.post_count = post_id;

        let amount = 1;
        let nft_objs = vector[];
        for (i in 0..amount) {
            let nft_obj = mint_nft_internal(creator_address, collection_obj, string::utf8(metadata_uri));
            vector::push_back(&mut nft_objs, nft_obj);
        };

        // Emit post created event
        event::emit(PostCreatedEvent {
            post_id,
            author: creator_address,
            timestamp: timestamp::now_seconds(),
        });
    }

    inline fun store_nft_metadata(
        col_obj_signer: &signer,
        uri: String,
        custom_id: String,
        logo_img: Option<String>,
        banner_img: Option<String>,
        featured_img: Option<String>,
        collection_address: address
    ) acquires UserCollectionMetadata {
        let logo = option::none<String>();
        if(option::is_some(&logo_img)) {
            logo = logo_img;
        };

        let banner = option::none<String>();
        if(option::is_some(&banner_img)) {
            banner = banner_img;
        };

        let featured = option::none<String>();
        if(option::is_some(&featured_img)) {
            featured = featured_img;
        };

        move_to(col_obj_signer, UserCollectionMetadata {
            created_at: timestamp::now_seconds(),
            logo_img: logo,
            custom_id,
            banner_img: banner,
            featured_img: featured,
            website: uri,
            collection_address
        });
    }

    /// Actual implementation of minting NFT
    fun mint_nft_internal(
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

    fun royalty(
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

    // public fun get_collection(collection_obj: Object<Collection>) {

    // }

    #[view]
    public fun create_media(url: vector<u8>, mimetype: vector<u8>): Media {
        Media { url, mimetype }
    }

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}