module aptos_social::utils {
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use std::vector;

    use aptos_std::table::{Self, Table};
    use aptos_std::string_utils;

    const UPPERCASE_A: u8 = 65; // ASCII value for 'A'
    const UPPERCASE_Z: u8 = 90; // ASCII value for 'Z'
    const LOWERCASE_A: u8 = 97; // ASCII value for 'a'
    const CASE_DIFFERENCE: u8 = 32; // Difference between uppercase and lowercase ASCII values
        
    public fun to_lowercase(s: &String): String {
        let bytes = string::bytes(s);
        let lowercase_bytes = vector::empty<u8>();

        let i = 0;
        while (i < vector::length(bytes)) {
            let char = *vector::borrow(bytes, i);
            if (char >= UPPERCASE_A && char <= UPPERCASE_Z) {
                vector::push_back(&mut lowercase_bytes, char + CASE_DIFFERENCE);
            } else {
                vector::push_back(&mut lowercase_bytes, char);
            };
            i = i + 1
        };

        string::utf8(lowercase_bytes)
    }

    public fun is_same_string(s1: String, s2: String): bool { 
        to_lowercase(&s1) == to_lowercase(&s2)
    }

    public fun extract_hashtags(content: &String): vector<String> {
        let bytes = string::bytes(content);
        let hashtags = vector::empty<String>();
        let current_hashtag = vector::empty<u8>();
        let in_hashtag = false;
        let i = 0;
        let len = vector::length(bytes);

        while (i < len) {
            let char = *vector::borrow(bytes, i);
            if (char == 35) { // '#' character
                if (!in_hashtag) {
                    in_hashtag = true;
                    current_hashtag = vector::empty<u8>();
                }
            } else if (in_hashtag) {
                if ((char >= 48 && char <= 57) || (char >= 65 && char <= 90) || (char >= 97 && char <= 122)) {
                    vector::push_back(&mut current_hashtag, char);
                } else {
                    in_hashtag = false;
                    if (!vector::is_empty(&current_hashtag)) {
                        let hashtag = string::utf8(current_hashtag);
                        let lowercase_hashtag = to_lowercase(&hashtag);
                        vector::push_back(&mut hashtags, lowercase_hashtag);
                    };
                }
            };
            i = i + 1;
        };

        if (in_hashtag && !vector::is_empty(&current_hashtag)) {
            let hashtag = string::utf8(current_hashtag);
            let lowercase_hashtag = to_lowercase(&hashtag);
            vector::push_back(&mut hashtags, lowercase_hashtag);
        };

        hashtags
    }
}
