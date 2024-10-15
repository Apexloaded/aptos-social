module aptos_social::listing {
    use std::option;
    use std::signer;

    use aptos_std::math64;

    use aptos_framework::object::{Self, ConstructorRef, DeleteRef, ExtendRef, Object};
    use aptos_framework::timestamp;

    use aptos_token_objects::token::{Self, Token};
    use aptos_token_objects::royalty;

    friend aptos_social::feeds;

    // Error codes
    const ERROR_INVALID_STRING: u64 = 0;
    const ERROR_UNAUTHORISED_ACCESS: u64 = 1;
    const ERROR_DUPLICATE_RESOURCE: u64 = 2;
    const ERROR_NOT_FOUND: u64 = 3;
    const ERROR_INVALID_PRICE: u64 = 4;
    const ERROR_PROCESS_FAILED: u64 = 5;
    const ERROR_LISTING_NOT_STARTED: u64 = 6;

    struct Listing has key {
        /// The item owned by this listing, transferred to the new owner at the end.
        object: Object<Token>,
        /// The seller of the object
        seller: address,
        /// The Unix timestamp in seconds at which point bidding and purchasing can occur
        start_time: u64,
        /// Used to clean-up at the end.
        delete_ref: DeleteRef,
        /// Used to create a signer to transfer the listed item, ideally the TransferRef would
        /// support this.
        extend_ref: ExtendRef,
    }

    public(friend) fun init(
        creator: &signer,
        object: Object<Token>,
        start_time: u64,
    ):(signer, ConstructorRef) {
        let creator_address = signer::address_of(creator);
        let constructor_ref = object::create_object(creator_address);
        // Once we construct this, both the listing and its contents are soulbound until the conclusion.
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        object::disable_ungated_transfer(&transfer_ref);
        let listing_signer = object::generate_signer(&constructor_ref);

        let listing = Listing {
            object,
            seller: signer::address_of(creator),
            start_time,
            delete_ref: object::generate_delete_ref(&constructor_ref),
            extend_ref: object::generate_extend_ref(&constructor_ref),
        };
        move_to(&listing_signer, listing);

        let listing_addr = object::address_from_constructor_ref(&constructor_ref);
        object::transfer(creator, object, listing_addr);

        (listing_signer, constructor_ref)
    }

    public(friend) fun calculate_royalty(object: Object<Listing>, amount: u64): (address, u64) acquires Listing {
        let listing = borrow_listing(object);
        let royalty = token::royalty(listing.object);
        if (option::is_some(&royalty)) {
            let royalty = option::destroy_some(royalty);
            let payee_address = royalty::payee_address(&royalty);
            let numerator = royalty::numerator(&royalty);
            let denominator = royalty::denominator(&royalty);

            let royalty_amount = bounded_percentage(amount, numerator, denominator);
            (payee_address, royalty_amount)
        } else {
            (@0x0, 0)
        }
    }

    public(friend) fun close(
        object: Object<Listing>,
        recipient: address,
    ): address acquires Listing {
        let listing_addr = object::object_address(&object);
        let Listing {
            object,
            seller,
            start_time: _,
            delete_ref,
            extend_ref,
        } = move_from<Listing>(listing_addr);

        let obj_signer = object::generate_signer_for_extending(&extend_ref);

        object::transfer(&obj_signer, object, recipient);
        object::delete(delete_ref);

        seller
    }

    public(friend) fun assert_started(object: &Object<Listing>): address acquires Listing {
        let listing_addr = object::object_address(object);
        assert!(exists<Listing>(listing_addr), ERROR_NOT_FOUND);

        let listing = borrow_global<Listing>(listing_addr);
        let now = timestamp::now_seconds();
        assert!(listing.start_time <= now, ERROR_LISTING_NOT_STARTED);
        listing_addr
    }

    /// Calculates a bounded percentage that can't go over 100% and handles 0 denominator as 0
    inline fun bounded_percentage(amount: u64, numerator: u64, denominator: u64): u64 {
        if (denominator == 0) {
            0
        } else {
            math64::min(amount, math64::mul_div(amount, numerator, denominator))
        }
    }

    inline fun borrow_listing(object: Object<Listing>): &Listing acquires Listing {
        let obj_addr = object::object_address(&object);
        assert!(exists<Listing>(obj_addr), ERROR_NOT_FOUND);
        borrow_global<Listing>(obj_addr)
    }
}
