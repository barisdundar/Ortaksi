import React from 'react'
import { TextInput, StyleSheet } from 'react-native'

// giriş ve kayıt menülerindeki yazı girişi komponenti için bunu kullanıyoruz
export default function Input(props) {
    // bize verilen tüm prop ları kullanıyoruz, normal stilimizi kullanıyoruz ama başka stil verildiyse onu da üstüne yazıyoruz
    return <TextInput {...props} style={{ ...styles.input, ...props.style }}></TextInput>
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        fontSize: 20,
        paddingLeft: 16,
        paddingTop: 8,
        paddingBottom: 8,
        width: 261, // genişlik
    }
})