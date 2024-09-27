#[test_only]
module aptos_social::test_end_to_end {
    use std::string::{Self, String};
    use std::vector;
    use aptos_std::debug;

    use aptos_social::utils;

    #[test]
    fun test_lowercase_utils() {
        let input = string::utf8(b"HeLLo WoRLd!");
        let expected = string::utf8(b"hello world!");
        let result = utils::to_lowercase(&input);
        assert!(result == expected, 1000);

        let input2 = string::utf8(b"APTOS MOVE");
        let expected2 = string::utf8(b"aptos move");
        let result2 = utils::to_lowercase(&input2);
        assert!(result2 == expected2, 1001);

        let input3 = string::utf8(b"already lowercase");
        let expected3 = string::utf8(b"already lowercase");
        let result3 = utils::to_lowercase(&input3);
        assert!(result3 == expected3, 1002);

        let input4 = string::utf8(b"123!@#");
        let expected4 = string::utf8(b"123!@#");
        let result4 = utils::to_lowercase(&input4);
        assert!(result4 == expected4, 1003);
    }

    #[test]
    fun test_same_string() {
        let s1 = string::utf8(b"hello!");
        let s2 = string::utf8(b"HELLO");
        let result = utils::is_same_string(s1, s2);
        assert!(!result, 1);
    }

    #[test]
    fun test_hashtag_extractor() {
        let content = string::utf8(b"hello jeffery #HOW are you #name, let get to know #tags");
        let result = utils::extract_hashtags(&content);
        
        // debug::print<vector<String>>(&result);

        //Verify the that first hashtag is how
        let hashtag = *vector::borrow(&result, 0);
        // debug::print<String>(&hashtag);
        assert!(hashtag == string::utf8(b"how"), 2);

        assert!(vector::length(&result) == 3, 1);
    }
    
}
