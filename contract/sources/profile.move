module aptos_social_host::aptos_social_profile {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::table::{Self};

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

    struct AptosSocialState has key {
        creator_count: u64,
        transaction_count: u64,
        creators: table::Table<address, Creator>,
        usernames: table::Table<String, address>,
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

    /// If you deploy the module under an object, sender is the object's signer
    /// If you deploy the module under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        move_to(sender, AptosSocialState {
            creator_count: 0,
            transaction_count: 0,
            creators: table::new(),
            usernames: table::new(),
            creator_addresses: vector::empty(),
            admin_addr: signer::address_of(sender),
            pending_admin_addr: option::none(),
        });
    }

    // Register a new creator
    public fun register_creator(
        creator: &signer,
        display_name: String,
        username: String,
        email_address: String,
        profile_url: String
    ) acquires AptosSocialState {
        let creator_address = signer::address_of(creator);
        let state = borrow_global_mut<AptosSocialState>(@aptos_social_host);
        let lowercase_username = aptos_social_utils::to_lowercase(&username);
        
        assert!(!table::contains(&state.creators, creator_address), ERROR_DUPLICATE_RESOURCE); // ERROR_DUPLICATE_RESOURCE
        assert!(!table::contains(&state.usernames, lowercase_username), ERROR_DUPLICATE_RESOURCE); // ERROR_DUPLICATE_RESOURCE
        assert!(string::length(&display_name) > 0 && string::length(&username) > 0 && string::length(&profile_url) > 0, ERROR_INVALID_STRING); // ERROR_INVALID_STRING

        let new_creator = Creator {
            name: display_name,
            username: lowercase_username,
            wallet: creator_address,
            email: email_address,
            pfp: string::utf8(b""),
            banner: string::utf8(b""),
            bio: string::utf8(b""),
            website: string::utf8(b""),
            profile_uri: profile_url,
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
            display_name,
            username: lowercase_username,
        });
    }

    // Update creator information
    public fun update_creator(creator: &signer, name: String, username: String, email: String, pfp: String, banner: String, bio: String, website: String) acquires AptosSocialState {
        let creator_address = signer::address_of(creator);
        let state = borrow_global_mut<AptosSocialState>(@aptos_social_host);
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
    public fun add_friend(creator: &signer, friend_address: address) acquires AptosSocialState {
        let creator_address = signer::address_of(creator);
        let state = borrow_global_mut<AptosSocialState>(@aptos_social_host);

        // Check if users exists
        assert!(table::contains(&state.creators, creator_address), ERROR_NOT_FOUND);
        assert!(table::contains(&state.creators, friend_address), ERROR_NOT_FOUND);
        
        // Add friend to user's friends list
        let creator_ref = table::borrow_mut(&mut state.creators, creator_address);
        vector::push_back(&mut creator_ref.friends, friend_address);
    }

    #[view]
    public fun is_name_taken(username: String): bool acquires AptosSocialState {
        let state = borrow_global<AptosSocialState>(@aptos_social_host);
        let lowercase_username = aptos_social_utils::to_lowercase(&username);
        table::contains(&state.usernames, lowercase_username)
    }

    // Retrieve a creator's profile by address
    #[view]
    public fun find_creator(creator_address: address): Creator acquires AptosSocialState {
        let state = borrow_global<AptosSocialState>(@aptos_social_host);
        *table::borrow(&state.creators, creator_address)
    }

    // Retrieve a creator's profile by username
    #[view]
    public fun find_creator_by_name(username: String): Creator acquires AptosSocialState {
        let state = borrow_global<AptosSocialState>(@aptos_social_host);
        let lower_username = aptos_social_utils::to_lowercase(&username);

        assert!(table::contains(&state.usernames, lower_username), ERROR_NOT_FOUND);

        let creator_address = table::borrow(&state.usernames, lower_username);
        *table::borrow(&state.creators, *creator_address)
    }

    #[view]
    public fun find_all_creators(): vector<Creator> acquires AptosSocialState {
        let state = borrow_global<AptosSocialState>(@aptos_social_host);

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
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }

    #[test(account = @aptos_social_host, aptos_framework = @0x1)]
    #[expected_failure(abort_code = ERROR_DUPLICATE_RESOURCE)]
    public fun test_register_creator(account: &signer, aptos_framework: &signer) acquires AptosSocialState {
        init_module_for_test(account);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let display_name = string::utf8(b"Test Creator");
        let username = string::utf8(b"testcreator");
        let email = string::utf8(b"testcreator@example.com");
        let profile_url = string::utf8(b"https://aptos.social/testcreator");

        register_creator(account, display_name, username, email, profile_url);
        let state = borrow_global<AptosSocialState>(@aptos_social_host);
        let creator_address = signer::address_of(account);
        assert!(state.creator_count == 1, 200);
        assert!(table::contains(&state.creators, creator_address), 201);

        let creator = find_creator(creator_address);
        assert!(creator.wallet == creator_address, 201); // Ensure wallet address matches
        assert!(creator.username == string::utf8(b"testcreator"), 202); // Ensure username matches

        // Try to register the same creator again and assert that it fails (duplicate)
        let duplicate_display_name = string::utf8(b"Another Creator");
        let duplicate_username = string::utf8(b"testcreator"); // Same username

        register_creator(account, duplicate_display_name, duplicate_username, email, profile_url);
    }

    #[test(account = @aptos_social_host, aptos_framework = @0x1)]
    public fun test_update_creator(account: &signer, aptos_framework: &signer) acquires AptosSocialState {
        init_module_for_test(account);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let display_name = string::utf8(b"Test Creator2");
        let username = string::utf8(b"testcreator2");
        let email = string::utf8(b"testcreator2@example.com");
        let profile_url = string::utf8(b"https://aptos.social/testcreator2");
        let pfp = string::utf8(b"https://aptos.social");
        let banner = string::utf8(b"https://aptos.social/banner");
        let bio = string::utf8(b"I am Test Creator 2");
        let website = string::utf8(b"testcreator2.com");

        register_creator(account, display_name, username, email, profile_url);

        let new_name = string::utf8(b"testcreator3");
        update_creator(account, display_name, new_name, email, pfp, banner, bio, website);

        let creator_address = signer::address_of(account);
        let creator = find_creator(creator_address);

        assert!(creator.wallet == creator_address, 201); // Ensure wallet address matches
        assert!(creator.username == new_name, 202); // Ensure username matches
        assert!(creator.website == website, 203); // Test that website is updated
    }

    #[test(account = @aptos_social_host, aptos_framework = @0x1, friend_account = @friend_addr)]
    public fun test_add_friend(account: &signer, aptos_framework: &signer, friend_account: &signer) acquires AptosSocialState {
        init_module_for_test(account);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        let display_name = string::utf8(b"Test Creator");
        let username = string::utf8(b"testcreator");
        let email = string::utf8(b"testcreator@example.com");
        let profile_url = string::utf8(b"https://aptos.social/testcreator");
        register_creator(account, display_name, username, email, profile_url);

        let display_name2 = string::utf8(b"Test Creator2");
        let username2 = string::utf8(b"testcreator2");
        let email2 = string::utf8(b"testcreator2@example.com");
        let profile_url2 = string::utf8(b"https://aptos.social/testcreator2");
        register_creator(friend_account, display_name2, username2, email2, profile_url2);

        let friend_address = signer::address_of(friend_account);
        add_friend(account, friend_address);

        // Fetch the global state
        let state = borrow_global<AptosSocialState>(@aptos_social_host);
        let creator_address = signer::address_of(account);

        // Fetch the creator's friend list
        let creator_state = table::borrow(&state.creators, creator_address);

        // Assert that the friend's address has been added to the creator's friends list
        assert!(vector::contains(&creator_state.friends, &friend_address), 1);
    }

    #[test(account = @aptos_social_host, aptos_framework = @0x1)]
    public fun test_find_user_by_name(account: &signer, aptos_framework: &signer) acquires AptosSocialState {
        init_module_for_test(account);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        let display_name = string::utf8(b"Test Creator");
        let username = string::utf8(b"testcreator");
        let email = string::utf8(b"testcreator@example.com");
        let profile_url = string::utf8(b"https://aptos.social/testcreator");
        register_creator(account, display_name, username, email, profile_url);

        let creator_address = signer::address_of(account);
        let creator = find_creator_by_name(string::utf8(b"testcreator"));
        assert!(creator.wallet == creator_address, 201); // Ensure wallet address matches
        assert!(creator.username == string::utf8(b"testcreator"), 202); // Ensure username matches
    }

    #[test(account = @aptos_social_host, aptos_framework = @0x1, friend_account = @friend_addr)]
    public fun test_list_all_users(account: &signer, aptos_framework: &signer, friend_account: &signer) acquires AptosSocialState {
        init_module_for_test(account);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        let display_name = string::utf8(b"Test Creator");
        let username = string::utf8(b"testcreator");
        let email = string::utf8(b"testcreator@example.com");
        let profile_url = string::utf8(b"https://aptos.social/testcreator");
        register_creator(account, display_name, username, email, profile_url);

        let display_name2 = string::utf8(b"Test Creator2");
        let username2 = string::utf8(b"testcreator2");
        let email2 = string::utf8(b"testcreator2@example.com");
        let profile_url2 = string::utf8(b"https://aptos.social/testcreator2");
        register_creator(friend_account, display_name2, username2, email2, profile_url2);

        // Fetch all users
        let creators = find_all_creators();
        
        // Verify the number of creators
        assert!(vector::length(&creators) == 2, 1);

        // Verify the details of each creator
        let creator1 = vector::borrow(&creators, 0);
        assert!(creator1.username == username, 2);

        let creator2 = vector::borrow(&creators, 1);
        assert!(creator2.username == username2, 3);
    }

    #[test(account = @aptos_social_host, aptos_framework = @0x1)]
    public fun test_is_name_taken(account: &signer, aptos_framework: &signer) acquires AptosSocialState {
        init_module_for_test(account);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        let display_name = string::utf8(b"Test Creator");
        let username = string::utf8(b"testcreator");
        let email = string::utf8(b"testcreator@example.com");
        let profile_url = string::utf8(b"https://aptos.social/testcreator");
        register_creator(account, display_name, username, email, profile_url);

        let result = is_name_taken(string::utf8(b"testcreator2332"));

        // Assert if the name is taken
        assert!(result == false, 1);
    }
}