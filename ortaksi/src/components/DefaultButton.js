import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

// uygulamada kullandığımız arka planı siyah ön plandaki yazısı sarı olan her buton için bu komponenti kullanıyoruz
export default function DefaultButton(props) {
    if (props.selected) { // eğer selected prop u verildiyse renklerin tam tersini kullanıyoruz, arkaplan sarı yazı siyah oluyor
        return <TouchableOpacity {...props} style={{ ...styles.buttonSelected, ...props.style }}>
            <Text style={{ ...styles.buttonTextSelected, ...props.textStyle }}>{props.children}</Text>
        </TouchableOpacity>
    } // eğer selected prop u verilmediyse normal renkleri kullanıyoruz
    else {
        return <TouchableOpacity {...props} style={{ ...styles.button, ...props.style }}>
            <Text style={{ ...styles.buttonText, ...props.textStyle }}>{props.children}</Text>
        </TouchableOpacity>
    }
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#000', // arkaplan rengi
        width: 223, // genişlik
        display: 'flex',
        flexDirection: 'column', // içindeki elemanların diziliş yönü
        alignItems: 'center', // içindeki elemanları hizala
        height: 40 // yükseklik
    },
    buttonSelected: {
        backgroundColor: '#FFCC00', // arkaplan rengi
        width: 223, // genişlik
        display: 'flex',
        flexDirection: 'column', // içindeki elemanların diziliş yönü
        alignItems: 'center', // içindeki elemanları hizala
        height: 40 // yükseklik
    },
    buttonText: {
        color: '#ffcc00', // yazı rengi
        fontWeight: 'bold', // yazı kalınlığı
        fontSize: 18,
        textAlignVertical: 'center', // yazıyı dikey hizala
        flex: 1
    },
    buttonTextSelected: {
        color: '#000', // yazı rengi
        fontWeight: 'bold', // yazı kalınlığı
        fontSize: 18,
        textAlignVertical: 'center', // yazıyı dikey hizala
        flex: 1
    }
})