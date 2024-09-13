#[test_only]
module aptos_social_host::test_end_to_end {
    use std::string;
    use aptos_social_host::aptos_social_utils;

    #[test]
    fun test_lowercase_utils() {
        let input = string::utf8(b"HeLLo WoRLd!");
        let expected = string::utf8(b"hello world!");
        let result = aptos_social_utils::to_lowercase(&input);
        assert!(result == expected, 1000);

        let input2 = string::utf8(b"APTOS MOVE");
        let expected2 = string::utf8(b"aptos move");
        let result2 = aptos_social_utils::to_lowercase(&input2);
        assert!(result2 == expected2, 1001);

        let input3 = string::utf8(b"already lowercase");
        let expected3 = string::utf8(b"already lowercase");
        let result3 = aptos_social_utils::to_lowercase(&input3);
        assert!(result3 == expected3, 1002);

        let input4 = string::utf8(b"123!@#");
        let expected4 = string::utf8(b"123!@#");
        let result4 = aptos_social_utils::to_lowercase(&input4);
        assert!(result4 == expected4, 1003);
    }

    #[test]
    fun test_same_string() {
        let s1 = string::utf8(b"hello!");
        let s2 = string::utf8(b"HELLO");
        let result = aptos_social_utils::is_same_string(s1, s2);
        assert!(!result, 1);
    }
}
