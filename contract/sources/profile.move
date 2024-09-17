module aptos_social_host::aptos_social_profile {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::table::{Self, Table};

    use aptos_framework::event;
    use aptos_framework::timestamp;

    use aptos_social_host::aptos_social_utils;

    // Error codes
    const ERROR_INVALID_STRING: u64 = 0;
    const ERROR_UNAUTHORISED_ACCESS: u64 = 1;
    const ERROR_DUPLICATE_RESOURCE: u64 = 2;
    const ERROR_NOT_FOUND: u64 = 3;
    const ERROR_INVALID_PRICE: u64 = 4;
    const ERROR_PROCESS_FAILED: u64 = 5;

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
        friends: vector<address>,
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
        let state = borrow_global_mut<AptosSocialProfileState>(@aptos_social_host);
        let lowercase_username = aptos_social_utils::to_lowercase(&username);
        
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
            friends: vector::empty(),
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
    public fun update_creator(
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
        let state = borrow_global_mut<AptosSocialProfileState>(@aptos_social_host);
        let lowercase_username = aptos_social_utils::to_lowercase(&username);

        assert!(table::contains(&state.creators, creator_address), ERROR_NOT_FOUND);
        assert!(string::length(&name) > 0 && string::length(&username) > 0, ERROR_INVALID_STRING); // ERROR_INVALID_STRING

        let creator = table::borrow_mut(&mut state.creators, creator_address);

        if(!aptos_social_utils::is_same_string(creator.username, username)) {
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

    // Add new friends
    public fun add_friend(
        creator: &signer,
        friend_address: address
    ) acquires AptosSocialProfileState {
        let creator_address = signer::address_of(creator);
        let state = borrow_global_mut<AptosSocialProfileState>(@aptos_social_host);

        // Check if users exists
        assert!(table::contains(&state.creators, creator_address), ERROR_NOT_FOUND);
        assert!(table::contains(&state.creators, friend_address), ERROR_NOT_FOUND);
        
        // Add friend to user's friends list
        let creator_ref = table::borrow_mut(&mut state.creators, creator_address);
        vector::push_back(&mut creator_ref.friends, friend_address);
    }

    #[view]
    public fun profile_exists(creator: address): bool acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social_host);
        table::contains(&state.creators, creator)
    }

    #[view]
    public fun is_name_taken(username: String): bool acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social_host);
        let lowercase_username = aptos_social_utils::to_lowercase(&username);
        table::contains(&state.usernames, lowercase_username)
    }

    // Retrieve a creator's profile by address
    #[view]
    public fun find_creator(creator_address: address): Creator acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social_host);
        *table::borrow(&state.creators, creator_address)
    }

    // Retrieve a creator's profile by username
    #[view]
    public fun find_creator_by_name(username: String): Creator acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social_host);
        let lower_username = aptos_social_utils::to_lowercase(&username);

        assert!(table::contains(&state.usernames, lower_username), ERROR_NOT_FOUND);

        let creator_address = table::borrow(&state.usernames, lower_username);
        *table::borrow(&state.creators, *creator_address)
    }

    #[view]
    public fun find_all_creators(): vector<Creator> acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social_host);

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

    #[test_only]
    /// Get all registered Creators
    public entry fun verify_creator_exists(creator_address: address): bool acquires AptosSocialProfileState {
        let state = borrow_global<AptosSocialProfileState>(@aptos_social_host);
        table::contains(&state.creators, creator_address)
    }

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}