#[test_only]
module aptos_social::feeds_test {
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    use aptos_std::debug;

    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::object::{Self, Object, ObjectCore, ExtendRef};
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    use aptos_token_objects::collection::{Self, Collection};
    
    use aptos_social::feeds::{Self, Media, CollectionMetadata, PostItem};
    use aptos_social::trends;
    use aptos_social::profile_test;

    #[test(aptos_framework = @0x1, account = @aptos_social)]
    fun test_create_collection(
        aptos_framework: &signer,
        account: &signer
    ) {
        // current timestamp is 0 after initialization
        timestamp::set_time_has_started_for_testing(aptos_framework);

        feeds::init_module_for_test(account);
        trends::init_module_for_test(account);

        profile_test::test_register_creator(account, aptos_framework);
        // Test inputs
        let name = string::utf8(b"Aptos Social Collection");
        let description = string::utf8(b"This is the official Aptos Social Collection");
        let uri = string::utf8(b"ipfs://some_metadata");
        let max_supply = 10000;
        let custom_id = string::utf8(b"james-d");
        let royalty_percentage = option::some(10);
        let logo = option::some(string::utf8(b"ipfs://"));
        let banner = option::some(string::utf8(b"ipfs://"));
        let featured = option::some(string::utf8(b"ipfs://"));

        feeds::create_collection(account, name, description, max_supply, custom_id, royalty_percentage, logo, banner, featured);

        let result = feeds::get_global_collections();
        let collection_1 = *vector::borrow(&result, vector::length(&result) - 1);

        let metadata = feeds::get_metadata(collection_1);
        debug::print<CollectionMetadata>(&metadata);

        assert!(vector::length(&result) == 1, 1);
    }

    #[test(account = @aptos_social, aptos_framework = @0x1, user1 = @0x200, user2 = @0x201)]
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

        // feeds::init_module_for_test(account);

        // Test inputs
        let token_id = b"token123";
        let content = string::utf8(b"Sample post content");
        let price = 1000;
        let token_address = 0x1;
        let metadata_uri = string::utf8(b"ipfs://some_metadata");
        let media_urls = vector::singleton(string::utf8(b"http://example.com/image.png"));
        let media_mimetypes = vector::singleton(string::utf8(b"image/png"));

        let m_vector = vector::empty<Media>();
        let media = feeds::create_media(string::utf8(b"http://example.com/image.png"), string::utf8(b"image/png"));
        vector::push_back(&mut m_vector, media);

        // debug::print<vector<u8>>(&content);

        test_create_collection(aptos_framework, account);

        let result = feeds::get_global_collections();
        let collection_1 = *vector::borrow(&result, vector::length(&result) - 1);

        // debug::pring<Object<Collection>>(collection_1);
        
        let creator_address = signer::address_of(account);
        // debug::print<address>(&creator_address);
        let owner_constructor_ref = &object::create_object(creator_address);
        let owner_obj_signer = &object::generate_signer(owner_constructor_ref);
        let address_of_owner = signer::address_of(owner_obj_signer);

        let owner = object::is_owner(collection_1, address_of_owner);

        // debug::print<signer>(owner_obj_signer);
        // debug::print<bool>(&owner);
        // profile_test::test_register_creator(account, aptos_framework);

        // let collection_address = object::object_address(collection_1);

        feeds::mint_post(account, content, price, media_urls, media_mimetypes, metadata_uri, collection_1, true);
    }

    #[test(account = @aptos_social, aptos_framework = @0x1, user1 = @0x200, user2 = @0x201)]
    fun test_comment(
        account: &signer,
        aptos_framework: &signer,
        user1: &signer,
        user2: &signer
    ) {
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);

        test_mint_post(account, aptos_framework, user1, user2);

        // current timestamp is 0 after initialization
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(user1_addr);
        account::create_account_for_test(user2_addr);

        // Comments
        let comments = vector::empty<String>();
        let comment1 = string::utf8(b"Hello world");
        let comment2 = string::utf8(b"This is a second comment");
        let comment3 = string::utf8(b"Final test comment");
        vector::push_back(&mut comments, comment1);
        vector::push_back(&mut comments, comment2);
        vector::push_back(&mut comments, comment3);

        let i = 0;
        while(i < 3) {
            let comment = *vector::borrow(&comments, i);
            feeds::add_comment(account, 1, comment);
            i = i + 1;
        };
        
        let post_comments = feeds::get_comments(1);
        debug::print<vector<PostItem>>(&post_comments);
        assert!(vector::length(&post_comments) == 3, 1);
    }

    #[test(account = @aptos_social, aptos_framework = @0x1, user1 = @0x200, user2 = @0x201)]
    fun test_like_unlike(
        account: &signer,
        aptos_framework: &signer,
        user1: &signer,
        user2: &signer
    ) {
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);

        test_mint_post(account, aptos_framework, user1, user2);

        // current timestamp is 0 after initialization
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(user1_addr);
        account::create_account_for_test(user2_addr);

        feeds::like(account, 1);

        let likes = feeds::get_likes(1);

        assert!(vector::contains(&likes, &signer::address_of(account)), 300);

        feeds::unlike(account, 1);

        let unliked = feeds::get_likes(1);

        assert!(vector::length(&unliked) == 0, 2);
    }

}