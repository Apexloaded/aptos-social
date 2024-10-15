#[test_only]
module aptos_social::test_community {
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::debug;

    use aptos_framework::account;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::coin;
    use aptos_framework::object::{Self};
    use aptos_framework::timestamp;

    use aptos_social::community::{Self, Community};
    use aptos_social::profile::{Self};
    use aptos_social::feeds::{Self};

    #[test(aptos_framework = @0x1, account = @aptos_social)]
    fun test_add_community(aptos_framework: &signer, account: &signer) {
        // current timestamp is 0 after initialization
        timestamp::set_time_has_started_for_testing(aptos_framework);

        community::init_module_for_test(account);
        profile::init_module_for_test(account);

        let name = string::utf8(b"Aptos Social Community");
        let description = string::utf8(b"This is the official Aptos Social Community");
        let entry_fee = 4;
        let is_messageable = true;
        let is_paid = true;

        profile::register_creator(account, string::utf8(b"User A"), string::utf8(b"user_a"), string::utf8(b"user_a@email.com"), string::utf8(b"pfp_A"));
        community::create_community(account, string::utf8(b"7865467839"), name, description, entry_fee, is_messageable, is_paid, string::utf8(b"logo"), string::utf8(b"banner"));
        community::create_community(account, string::utf8(b"0987654678"), string::utf8(b"Second"), description, entry_fee, is_messageable, is_paid, string::utf8(b"logo"), string::utf8(b"banner"));

        let communities = community::get_communities();
        // debug::print<vector<address>>(&communities);
        assert!(vector::length(&communities) == 2, 505);
        let com_addr = *vector::borrow(&communities, 0);
        let community = object::address_to_object<Community>(com_addr);

        // debug::print<String>(&name);
        //debug::print<Object<Community>>(&community);
        let comm_name = community::get_community_name(com_addr);
        debug::print<String>(&comm_name);
        assert!(comm_name == name, 506);
        // let config = borrow_global<CommunityAccessConfig>(com_addr);
        // debug::print<Community>(&comm);
        // debug::print<address>(&config.owner);
        let newName = string::utf8(b"Aptos New Name");
        community::set_community_name(com_addr, newName);
        let comm_name1 = community::get_community_name(com_addr);
        assert!(comm_name1 == newName, 500);
        // debug::print<Community>(&comm);
        let user_address = signer::address_of(account);
        // debug::print<bool>(&object::is_owner(community, user_address))
        assert!(object::is_owner(community, user_address), 403);
    }

    #[test(aptos_framework = @0x1, account = @aptos_social, user1 = @0x200,)]
    fun test_join_community(aptos_framework: &signer, account: &signer, user1: &signer) {
        test_add_community(aptos_framework, account);

        profile::register_creator(user1, string::utf8(b"User B"), string::utf8(b"user_b"), string::utf8(b"user_b@email.com"), string::utf8(b"pfp_B"));

        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        
        let user_addr = signer::address_of(user1);
        account::create_account_for_test(user_addr);
        coin::register<AptosCoin>(user1);
        
        let coins = coin::mint(10000, &mint_cap);
        coin::deposit(user_addr, coins);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
        
        let communities = community::get_communities();
        let com_addr = *vector::borrow(&communities, vector::length(&communities) - 1);

        community::join_community<AptosCoin>(user1, com_addr);

        let members = community::get_community_members(com_addr);
        assert!(vector::length(&members) == 2, 404);
    }

    #[test(aptos_framework = @0x1, account = @aptos_social, user1 = @0x201,)]
    fun test_post_in_community(aptos_framework: &signer, account: &signer, user1: &signer) {
        // current timestamp is 0 after initialization
        timestamp::set_time_has_started_for_testing(aptos_framework);

        community::init_module_for_test(account);
        profile::init_module_for_test(account);
        feeds::init_module_for_test(account);

        let name = string::utf8(b"Aptos Social Community");
        let description = string::utf8(b"This is the official Aptos Social Community");
        let entry_fee = 4;
        let is_messageable = true;
        let is_paid = true;

        profile::register_creator(account, string::utf8(b"User A"), string::utf8(b"user_a"), string::utf8(b"user_a@email.com"), string::utf8(b"pfp_A"));
        profile::register_creator(user1, string::utf8(b"User B"), string::utf8(b"user_b"), string::utf8(b"user_b@email.com"), string::utf8(b"pfp_B"));
        community::create_community(account, string::utf8(b"987657889889"), name, description, entry_fee, is_messageable, is_paid, string::utf8(b"logo"), string::utf8(b"banner"));

        let user_addr = signer::address_of(user1);

        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
    
        account::create_account_for_test(user_addr);
        coin::register<AptosCoin>(user1);
        
        let coins = coin::mint(10000, &mint_cap);
        coin::deposit(user_addr, coins);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
        
        let communities = community::get_communities();
        let com_addr = *vector::borrow(&communities, vector::length(&communities) - 1);

        community::join_community<AptosCoin>(user1, com_addr);

        community::post_in_community(
            user1,
            com_addr,
            string::utf8(b"Hello world!"),
            vector::singleton(string::utf8(b"http://example.com/image.png")),
            vector::singleton(string::utf8(b"image/png")),
            true
        );

        // let posts = community::get_community_posts(com_addr);
        // assert!(vector::length(&posts) == 1, 505);
    }


}