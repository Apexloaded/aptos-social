#[test_only]
module aptos_social_host::feeds_test {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;

    use aptos_std::debug;

    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::object::{Self, Object, ObjectCore, ExtendRef};
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    use aptos_token_objects::collection::{Self, Collection};
    
    use aptos_social_host::aptos_social_feeds::{Self, Media};
    use aptos_social_host::profile_test;

    #[test(aptos_framework = @0x1, account = @aptos_social_host)]
    fun test_create_collection(
        aptos_framework: &signer,
        account: &signer
    ) {
        // current timestamp is 0 after initialization
        timestamp::set_time_has_started_for_testing(aptos_framework);

        aptos_social_feeds::init_module_for_test(account);

        profile_test::test_register_creator(account, aptos_framework);
        // Test inputs
        let name = string::utf8(b"Aptos Social Collection");
        let description = string::utf8(b"This is the official Aptos Social Collection");
        let uri = string::utf8(b"ipfs://some_metadata");
        let max_supply = 10000;
        let custom_id = string::utf8(b"james-d");
        let royalty_percentage = option::some(10);
        let logo = option::none();
        let banner = option::none();
        let featured = option::none();

        aptos_social_feeds::create_collection(account, name, description, max_supply, custom_id, royalty_percentage, logo, banner, featured);

        let result = aptos_social_feeds::get_global_collections();
        let collection_1 = *vector::borrow(&result, vector::length(&result) - 1);

        // debug::print<vector<Object<Collection>>>(&result);
        assert!(vector::length(&result) == 1, 1);
    }

    #[test(account = @aptos_social_host, aptos_framework = @0x1, user1 = @0x200, user2 = @0x201)]
    fun test_mint_post(
        account: &signer,
        aptos_framework: &signer,
        user1: &signer,
        user2: &signer
    ) {
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);

        // current timestamp is 0 after initialization
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(user1_addr);
        account::create_account_for_test(user2_addr);

        // aptos_social_feeds::init_module_for_test(account);

        // Test inputs
        let token_id = b"token123";
        let content = b"Sample post content";
        let price = 1000;
        let token_address = 0x1;
        let metadata_uri = b"ipfs://some_metadata";
        let media_urls = vector::singleton(b"http://example.com/image.png");
        let media_mimetypes = vector::singleton(b"image/png");


        // debug::print<vector<u8>>(&content);

        test_create_collection(aptos_framework, account);

        let result = aptos_social_feeds::get_global_collections();
        let collection_1 = *vector::borrow(&result, vector::length(&result) - 1);

        // debug::pring<Object<Collection>>(collection_1);
        
        let creator_address = signer::address_of(account);
        debug::print<address>(&creator_address);
        let owner_constructor_ref = &object::create_object(creator_address);
        let owner_obj_signer = &object::generate_signer(owner_constructor_ref);
        let address_of_owner = signer::address_of(owner_obj_signer);

        let owner = object::is_owner(collection_1, address_of_owner);

        // debug::print<signer>(owner_obj_signer);
        // debug::print<bool>(&owner);
        // profile_test::test_register_creator(account, aptos_framework);

        // let collection_address = object::object_address(collection_1);

        aptos_social_feeds::mint_post(account, content, price, media_urls, media_mimetypes, metadata_uri, collection_1);
    }

}