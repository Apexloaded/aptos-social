module aptos_social::community {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::table::{Self, Table};
    use aptos_std::ed25519;

    use aptos_std::debug;

    use aptos_framework::account;
    use aptos_framework::chain_id;
    use aptos_framework::aptos_account;
    use aptos_framework::coin::{Self};
    use aptos_framework::object::{Self, ExtendRef, TransferRef, DeleteRef};
    use aptos_framework::timestamp;

    use aptos_social::utils::{Self, IPaginatedData};
    use aptos_social::feeds::{Self, PostItem};
    use aptos_social::profile::{Self};

    // Error codes
    const ERROR_INVALID_STRING: u64 = 0;
    const ERROR_UNAUTHORISED_ACCESS: u64 = 1;
    const ERROR_DUPLICATE_RESOURCE: u64 = 2;
    const ERROR_NOT_FOUND: u64 = 3;

    struct Community has key, copy, drop {
        id: u64,
        community_hash: String,
        name: String,
        description: String,
        logo: String,
        banner: String,
        owner: address,
        members: vector<address>,
        is_paid: bool,
        is_messageable: bool,
        entry_fee: u64,
        posts: vector<u64>,
        created_at: u64,
    }

    struct CommunityAccessConfig has key {
        // community: Object<Community>,
        delete_ref: DeleteRef,
        extend_ref: ExtendRef,
        transfer_ref: TransferRef,
        owner: address,
    }

    struct UserCommunityState has key, copy {
        owned_communities: vector<address>,
        joined_communities: vector<address>,
    }

    struct AptosSocialCommunityState has key { 
        community_count: u64,
        community_item: Table<u64, address>, // community count => community address
        community_hash: Table<String, u64>, // off chain id => community id
        communities: vector<address>,
        public_posts: vector<u64>
    }

    fun init_module(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<AptosSocialCommunityState>(account_addr), ERROR_DUPLICATE_RESOURCE);

        let state = AptosSocialCommunityState {
            community_count: 0,
            community_item: table::new(),
            community_hash: table::new(),
            communities: vector::empty(),
            public_posts: vector::empty()
        };

        move_to(account, state);
    }

    public entry fun create_community(
        account: &signer,
        community_hash: String,
        name: String,
        description: String,
        entry_fee: u64,
        is_messageable: bool,
        is_paid: bool,
        logo: String,
        banner: String
    ) acquires UserCommunityState, AptosSocialCommunityState {
        let state = borrow_global_mut<AptosSocialCommunityState>(@aptos_social);
        let owner = signer::address_of(account);
        assert!(profile::profile_exists(owner), ERROR_UNAUTHORISED_ACCESS);
        assert!(!table::contains(&state.community_hash, community_hash), ERROR_DUPLICATE_RESOURCE);

        let constructor_ref = object::create_object(owner);
        let object_signer = object::generate_signer(&constructor_ref);
        let community_address = object::address_from_constructor_ref(&constructor_ref);

        // let community = object::object_from_constructor_ref(&constructor_ref);
        let community_id = state.community_count + 1;
        state.community_count = community_id;

        vector::push_back(&mut state.communities, community_address);
        table::add(&mut state.community_item, community_id, community_address);
        table::add(&mut state.community_hash, community_hash, community_id)

        move_to(&object_signer, Community {
            id: community_id,
            community_hash,
            owner,
            name,
            description,
            logo,
            banner,
            is_paid,
            is_messageable,
            entry_fee,
            members: vector::singleton(owner),
            posts: vector::empty(),
            created_at: timestamp::now_seconds()
        });

        let extend_ref = object::generate_extend_ref(&constructor_ref);
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        let delete_ref = object::generate_delete_ref(&constructor_ref);
        move_to(&object_signer, CommunityAccessConfig { extend_ref, transfer_ref, owner, delete_ref });

        if (!exists<UserCommunityState>(owner)) {
            move_to(account, UserCommunityState { 
                owned_communities: vector::empty(), 
                joined_communities: vector::empty() 
            });
        };

        let user_ref = borrow_global_mut<UserCommunityState>(owner);
        vector::push_back(&mut user_ref.owned_communities, community_address);
    }

    public entry fun join_community<CoinType>(
        account: &signer,
        community_address: address
    ) acquires UserCommunityState, Community {
        let community_ref = borrow_global_mut<Community>(community_address);
        let user_address = signer::address_of(account);
        let community_obj = object::address_to_object<Community>(community_address);

        assert!(profile::profile_exists(user_address), ERROR_UNAUTHORISED_ACCESS);
        assert!(exists<Community>(community_address), ERROR_NOT_FOUND);
        assert!(!object::is_owner(community_obj, user_address), ERROR_UNAUTHORISED_ACCESS);

        // If it is a paid community, ensure payment is made
        if (community_ref.is_paid) {
            let entry_fee = community_ref.entry_fee;
            let coins = coin::withdraw<CoinType>(account, entry_fee);
            aptos_account::deposit_coins(community_ref.owner, coins);
        };

        // Add user to the community's member list
        vector::push_back(&mut community_ref.members, user_address);

        // Track that the user has joined this community
        if (!exists<UserCommunityState>(user_address)) {
            move_to(account, UserCommunityState { 
                owned_communities: vector::empty(), 
                joined_communities: vector::empty() 
            });
        };
        let user_ref = borrow_global_mut<UserCommunityState>(user_address);
        vector::push_back(&mut user_ref.joined_communities, community_address);
    }

    public entry fun post_in_community(
        account: &signer,
        community_address: address,
        content: String,
        media_urls: vector<String>,
        media_mimetypes: vector<String>,
        is_public: bool,
    ) acquires Community, AptosSocialCommunityState {
        let user_address = signer::address_of(account);
        assert!(string::length(&content) > 0, ERROR_INVALID_STRING);
        
        let community = borrow_community(community_address);
        let community_obj = object::address_to_object<Community>(community_address);
        if(!object::is_owner(community_obj, user_address)) {
            assert!(community.is_messageable, ERROR_UNAUTHORISED_ACCESS);
            assert!(vector::contains(&community.members, &user_address), ERROR_NOT_FOUND);
        };

        let (post_id, _) = feeds::mint_community_post(
            account,
            content,
            media_urls,
            media_mimetypes,
            option::some(community_address)
        );

        let community_ref = borrow_global_mut<Community>(community_address);
        vector::push_back(&mut community_ref.posts, post_id);

        if(is_public) {
            let state = borrow_global_mut<AptosSocialCommunityState>(@aptos_social);
            vector::push_back(&mut state.public_posts, post_id);
        }
    }

    #[view]
    public fun get_community_posts(
        community_address: address,
        user: address,
        page: u64,
        items_per_page: u64,
    ): IPaginatedData<PostItem> acquires Community {
        // Verify that the public key bytes, match the onchcain authentication key
        // let public_key = ed25519::new_unvalidated_public_key_from_bytes(pub_key);
        // let authentication_key = ed25519::unvalidated_public_key_to_authentication_key(&public_key);
        // let sender_auth_key = account::get_authentication_key(user);
        // assert!(sender_auth_key == authentication_key, ERROR_UNAUTHORISED_ACCESS);

        // let chain_id = chain_id::get();

        // let to_check = CanViewProof {
        //     viewer: user,
        //     community: community_address,
        //     chain_id
        // };
        
        // let signature = ed25519::new_signature_from_bytes(sig);
        // assert!(
        //     ed25519::signature_verify_strict_t(&signature, &public_key, to_check),
        //     ERROR_UNAUTHORISED_ACCESS
        // );

        let community = borrow_community(community_address);

        let posts_array = utils::paginate<u64>(&community.posts, page, items_per_page);
        let posts = vector::empty<PostItem>();
        let length = vector::length(&posts_array);
        let i = 0;
        while (i < length) {
            let post_id = *vector::borrow(&posts_array, i);
            let post = feeds::get_post_by_id(post_id);
            vector::push_back(&mut posts, post);
            i = i + 1;
        };

        let data = utils::make_paginated_data<PostItem>(posts, vector::length(&community.posts));

        data
    }

    public fun get_public_feeds(
        page: u64,
        items_per_page: u64
    ): IPaginatedData<PostItem> acquires AptosSocialCommunityState {
        let state = borrow_global_mut<AptosSocialCommunityState>(@aptos_social);
        let borrowed_posts = state.public_posts;
        let posts_array = utils::paginate<u64>(&borrowed_posts, page, items_per_page);
        let posts = vector::empty<PostItem>();
        let length = vector::length(&posts_array);
        let i = 0;
        while (i < length) {
            let post_id = *vector::borrow(&posts_array, i);
            let post = feeds::get_post_by_id(post_id);
            vector::push_back(&mut posts, post);
            i = i + 1;
        };

        let data = utils::make_paginated_data<PostItem>(posts, vector::length(&borrowed_posts));

        data
    }

    #[view]
    public fun get_communities(): vector<address> acquires AptosSocialCommunityState {
        let state = borrow_global_mut<AptosSocialCommunityState>(@aptos_social);
        state.communities
    }

    #[view]
    public fun get_community(community_address: address): Community acquires Community {
        *borrow_community(community_address)
    }

    #[view]
    public fun get_owned_communities(owner: address): vector<address> acquires UserCommunityState {
        let state = borrow_global<UserCommunityState>(owner);
        state.owned_communities
    }

    inline fun borrow_community(community: address): &Community acquires Community {
        assert!(exists<Community>(community), ERROR_NOT_FOUND);
        borrow_global<Community>(community)
    }

    #[test_only]
    public fun init_module_for_test(account: &signer) {
        init_module(account);
    }

    #[test_only]
    public fun get_community_name(community_address: address): String acquires Community {
        let comm = *borrow_community(community_address);
        comm.name
    }

    #[test_only]
    public fun get_community_members(community_address: address): vector<address> acquires Community {
        let comm = *borrow_community(community_address);
        comm.members
    }

    #[test_only]
    public fun set_community_name(community_address: address, name: String) acquires Community {
        let comm_ref = borrow_global_mut<Community>(community_address);
        comm_ref.name = name;
    }
}