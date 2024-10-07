module aptos_social::events {
    use std::option::{Self, Option};
    use std::string::String;

    use aptos_framework::event;
    use aptos_framework::object::{Self, Object};

    friend aptos_social::feeds;
    friend aptos_social::listing;
    friend aptos_social::profile;
    friend aptos_social::utils;
    
    #[event]
    /// An event triggered when a collection is created
    struct CollectionCreated has drop, store {
        creator_addr: address,
        collection: address,
        max_supply: u64,
        name: String,
        description: String,
        uri: String,
    }

    public(friend) fun emit_collection_created<T: key>(
        creator_addr: address,
        collection: Object<T>,
        max_supply: u64,
        name: String,
        description: String,
        uri: String,
    ) {
        event::emit(CollectionCreated {
            creator_addr,
            collection: object::object_address(&collection),
            max_supply,
            name,
            description,
            uri
        });
    }

    #[event]
    /// An event triggered when a post is created
    struct PostCreated has drop, store {
        post_id: u64,
        author: address,
        timestamp: u64,
    }

    public(friend) fun emit_post_created(
        post_id: u64,
        author: address,
        timestamp: u64,
    ) {
        event::emit(PostCreated {
            post_id,
            author,
            timestamp
        });
    }

    #[event]
    /// An event triggered when a comment is made on a post
    struct CommentAdded has drop, store {
        comment_id: u64,
        post_id: u64,
        author: address,
        timestamp: u64,
    }

    public(friend) fun emit_comment_added(
        comment_id: u64,
        post_id: u64,
        author: address,
        timestamp: u64,
    ) {
        event::emit(CommentAdded {
            comment_id,
            post_id,
            author,
            timestamp
        });
    }

    #[event]
    struct PostCollected has drop, store {
        listing: address,
        seller: address,
        purchaser: address,
        price: u64,
        royalties: u64,
    }

    public(friend) fun emit_listing_filled(
        listing: address,
        seller: address,
        purchaser: address,
        price: u64,
        royalties: u64,
    ) {
        event::emit(PostCollected {
            listing,
            seller,
            purchaser,
            price,
            royalties,
        });
    }

    #[event]
    struct PaymentSent has drop, store {
        sender: address,
        recipient: address,
        amount: u64,
    }

    public(friend) fun emit_payment_sent(
        sender: address,
        recipient: address,
        amount: u64,
    ) {
        event::emit(PaymentSent {
            sender,
            recipient,
            amount,
        });
    }

}
