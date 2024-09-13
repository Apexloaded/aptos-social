module aptos_social_host::aptos_social_utils {
    use std::string::{Self, String};
    use std::vector;

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
}
