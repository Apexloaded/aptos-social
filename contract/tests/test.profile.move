#[test_only]
module aptos_social::profile_test {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;

    use aptos_std::debug;
    use aptos_std::table::{Self, Table};

    use aptos_framework::timestamp;

    use aptos_social::feeds::{Self, Media};
    use aptos_social::profile::{Self, Creator, Recommendation, UserInteraction};
    
    #[test(account = @aptos_social, aptos_framework = @0x1)]
    public fun test_register_creator(account: &signer, aptos_framework: &signer) {
        profile::init_module_for_test(account);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let display_name = string::utf8(b"Test Creator");
        let username = string::utf8(b"testcreator");
        let email = string::utf8(b"testcreator@example.com");
        let profile_url = string::utf8(b"https://aptos.social/testcreator");

        profile::register_creator(account, display_name, username, email, profile_url);
        
        let creator_address = signer::address_of(account);
        let isAvailable = profile::verify_creator_exists(creator_address);
        
        assert!(isAvailable, 201);

        // let creator = profile::find_creator(creator_address);
        // assert!(creator.wallet == creator_address, 201); // Ensure wallet address matches
        // assert!(creator.username == string::utf8(b"testcreator"), 202); // Ensure username matches
    }

    #[test(
        account = @aptos_social,
        aptos_framework = @0x1,
        user1 = @0x200,
        user2 = @0x201,
        user3 = @0x202,
        user4 = @0x203,
        user5 = @0x204
    )]
    public fun test_recommended_user(
        account: &signer,
        aptos_framework: &signer,
        user1: &signer,
        user2: &signer,
        user3: &signer,
        user4: &signer,
        user5: &signer
    ) {
        // Step 1: Initialize the profile module
        profile::init_module_for_test(account);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);
        let user3_addr = signer::address_of(user3);
        let user4_addr = signer::address_of(user4);
        let user5_addr = signer::address_of(user5);

        // Step 2: Register users (creators)
        profile::register_creator(account, string::utf8(b"User A"), string::utf8(b"user_a"), string::utf8(b"user_a@email.com"), string::utf8(b"pfp_A"));
        profile::register_creator(user1, string::utf8(b"User B"), string::utf8(b"user_b"), string::utf8(b"user_b@email.com"), string::utf8(b"pfp_B"));
        profile::register_creator(user2, string::utf8(b"User C"), string::utf8(b"user_c"), string::utf8(b"user_c@email.com"), string::utf8(b"pfp_C"));
        profile::register_creator(user3, string::utf8(b"User D"), string::utf8(b"user_d"), string::utf8(b"user_d@email.com"), string::utf8(b"pfp_D"));
        profile::register_creator(user4, string::utf8(b"User E"), string::utf8(b"user_e"), string::utf8(b"user_e@email.com"), string::utf8(b"pfp_E"));
        profile::register_creator(user5, string::utf8(b"User F"), string::utf8(b"user_f"), string::utf8(b"user_f@email.com"), string::utf8(b"pfp_F"));

        // Step 3: Simulate following relationships
        profile::follow(account, user1_addr); // User A follows User B
        profile::follow(account, user2_addr); // User A follows User C
        profile::follow(user1, user3_addr); // User B follows User D
        profile::follow(user1, user5_addr); // User B follows User D
        profile::follow(user2, user4_addr); // User C follows User D

        // Step 4: Simulate interactions
        profile::log_user_interaction(account, user1_addr, 10); // Strong interaction with User B
        profile::log_user_interaction(account, user2_addr, 50);  // Medium interaction with User C

        // Step 5: Call the recommendation function
        let recommendations = profile::recommend_users_to_follow(signer::address_of(account));

        // Step 6: Assert the recommendations
        let expected_recommendation = user3_addr;
        assert!(vector::contains(&recommendations, &expected_recommendation), 1);

        // Step 7: Debug print the recommendations for manual inspection
        debug::print(&string::utf8(b".............Recommendations............."));
        debug::print(&recommendations);
    }

    // #[test(account = @aptos_social, aptos_framework = @0x1)]
    // #[expected_failure(abort_code = ERROR_DUPLICATE_RESOURCE)]
    // public fun test_register_creator_dual(account: &signer, aptos_framework: &signer) acquires AptosSocialProfileState {
    //     test_register_creator(account, aptos_framework);
    //     // Try to register the same creator again and assert that it fails (duplicate)
    //     test_register_creator(account, aptos_framework);
    // }

    // #[test(account = @aptos_social, aptos_framework = @0x1)]
    // public fun test_update_creator(account: &signer, aptos_framework: &signer) acquires AptosSocialProfileState {
    //     init_module_for_test(account);
    //     timestamp::set_time_has_started_for_testing(aptos_framework);

    //     let display_name = string::utf8(b"Test Creator2");
    //     let username = string::utf8(b"testcreator2");
    //     let email = string::utf8(b"testcreator2@example.com");
    //     let profile_url = string::utf8(b"https://aptos.social/testcreator2");
    //     let pfp = string::utf8(b"https://aptos.social");
    //     let banner = string::utf8(b"https://aptos.social/banner");
    //     let bio = string::utf8(b"I am Test Creator 2");
    //     let website = string::utf8(b"testcreator2.com");

    //     register_creator(account, display_name, username, email, profile_url);

    //     let new_name = string::utf8(b"testcreator3");
    //     update_creator(account, display_name, new_name, email, pfp, banner, bio, website);

    //     let creator_address = signer::address_of(account);
    //     let creator = find_creator(creator_address);

    //     assert!(creator.wallet == creator_address, 201); // Ensure wallet address matches
    //     assert!(creator.username == new_name, 202); // Ensure username matches
    //     assert!(creator.website == website, 203); // Test that website is updated
    // }

    // #[test(account = @aptos_social, aptos_framework = @0x1, friend_account = @friend_addr)]
    // public fun test_add_friend(account: &signer, aptos_framework: &signer, friend_account: &signer) acquires AptosSocialProfileState {
    //     init_module_for_test(account);
    //     timestamp::set_time_has_started_for_testing(aptos_framework);
        
    //     let display_name = string::utf8(b"Test Creator");
    //     let username = string::utf8(b"testcreator");
    //     let email = string::utf8(b"testcreator@example.com");
    //     let profile_url = string::utf8(b"https://aptos.social/testcreator");
    //     register_creator(account, display_name, username, email, profile_url);

    //     let display_name2 = string::utf8(b"Test Creator2");
    //     let username2 = string::utf8(b"testcreator2");
    //     let email2 = string::utf8(b"testcreator2@example.com");
    //     let profile_url2 = string::utf8(b"https://aptos.social/testcreator2");
    //     register_creator(friend_account, display_name2, username2, email2, profile_url2);

    //     let friend_address = signer::address_of(friend_account);
    //     add_friend(account, friend_address);

    //     // Fetch the global state
    //     let state = borrow_global<AptosSocialProfileState>(@aptos_social);
    //     let creator_address = signer::address_of(account);

    //     // Fetch the creator's friend list
    //     let creator_state = table::borrow(&state.creators, creator_address);

    //     // Assert that the friend's address has been added to the creator's friends list
    //     assert!(vector::contains(&creator_state.friends, &friend_address), 1);
    // }

    // #[test(account = @aptos_social, aptos_framework = @0x1)]
    // public fun test_find_user_by_name(account: &signer, aptos_framework: &signer) acquires AptosSocialProfileState {
    //     init_module_for_test(account);
    //     timestamp::set_time_has_started_for_testing(aptos_framework);
        
    //     let display_name = string::utf8(b"Test Creator");
    //     let username = string::utf8(b"testcreator");
    //     let email = string::utf8(b"testcreator@example.com");
    //     let profile_url = string::utf8(b"https://aptos.social/testcreator");
    //     register_creator(account, display_name, username, email, profile_url);

    //     let creator_address = signer::address_of(account);
    //     let creator = find_creator_by_name(string::utf8(b"testcreator"));
    //     assert!(creator.wallet == creator_address, 201); // Ensure wallet address matches
    //     assert!(creator.username == string::utf8(b"testcreator"), 202); // Ensure username matches
    // }

    // #[test(account = @aptos_social, aptos_framework = @0x1, friend_account = @friend_addr)]
    // public fun test_list_all_users(account: &signer, aptos_framework: &signer, friend_account: &signer) acquires AptosSocialProfileState {
    //     init_module_for_test(account);
    //     timestamp::set_time_has_started_for_testing(aptos_framework);
        
    //     let display_name = string::utf8(b"Test Creator");
    //     let username = string::utf8(b"testcreator");
    //     let email = string::utf8(b"testcreator@example.com");
    //     let profile_url = string::utf8(b"https://aptos.social/testcreator");
    //     register_creator(account, display_name, username, email, profile_url);

    //     let display_name2 = string::utf8(b"Test Creator2");
    //     let username2 = string::utf8(b"testcreator2");
    //     let email2 = string::utf8(b"testcreator2@example.com");
    //     let profile_url2 = string::utf8(b"https://aptos.social/testcreator2");
    //     register_creator(friend_account, display_name2, username2, email2, profile_url2);

    //     // Fetch all users
    //     let creators = find_all_creators();
        
    //     // Verify the number of creators
    //     assert!(vector::length(&creators) == 2, 1);

    //     // Verify the details of each creator
    //     let creator1 = vector::borrow(&creators, 0);
    //     assert!(creator1.username == username, 2);

    //     let creator2 = vector::borrow(&creators, 1);
    //     assert!(creator2.username == username2, 3);
    // }

    // #[test(account = @aptos_social, aptos_framework = @0x1)]
    // public fun test_is_name_taken(account: &signer, aptos_framework: &signer) acquires AptosSocialProfileState {
    //     init_module_for_test(account);
    //     timestamp::set_time_has_started_for_testing(aptos_framework);
        
    //     let display_name = string::utf8(b"Test Creator");
    //     let username = string::utf8(b"testcreator");
    //     let email = string::utf8(b"testcreator@example.com");
    //     let profile_url = string::utf8(b"https://aptos.social/testcreator");
    //     register_creator(account, display_name, username, email, profile_url);

    //     let result = is_name_taken(string::utf8(b"testcreator2332"));

    //     // Assert if the name is taken
    //     assert!(result == false, 1);
    // }
}