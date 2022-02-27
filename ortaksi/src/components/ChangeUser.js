import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from "react-native";
import { testUsers } from '../Consts';
import useIsMounted from '../useIsMounted';
import DefaultButton from './DefaultButton';

// aşağıdaki test kullanıcı menüsünün komponenti
export default function ChangeUser({ top, onPress = () => {} }) {
    const isMounted = useIsMounted(); // komponent ekranda varmı yokmu ona ulaşmak için, yokken işlem yapınca hata oluşmaması için
    const [user, setUser] = useState({ email: '' }); // giriş yapmış kullanıcı

    useEffect(() => { // bu komponent ekrana ilk çıktığında
        const subscriber = auth().onAuthStateChanged((user) => { // eğer kullanıcı değişirse diye takip ediyoruz
            if (!isMounted.current) return; // eğer bu komponent ekranda varsa

            if (user != null) {
                setUser(user); // kullanıcı değiştiğnide kullanıcı null değilse değiştiriyoruz kullanıcıyı
            }
        });
        return subscriber; // komponent ekrandan kaldırırken kullanıcı değişirse diye takip ettiğimiz şeyi yok ediyoruz artık gerek yok
    }, []);

    // username, password verilen kullanıcıyı giriş yaptırmak için
    function logIn(username, password) {
        auth()
            .signInWithEmailAndPassword(username, password) // giriş yapıyoruz
            .catch(error => console.error(error)) // hata varsa konsola yazdırıyoruz
    }

    // kullanıcı test menüsünde kull. a butonuna basıldığında bu fonksiyon çağrılıyor
    function userA() {
        if (auth().currentUser && auth().currentUser.email === "kullanicia@kullanicia.com") return; // eğer zaten bu kullanıcıdaysak bidaha geçmeye uğraşmıyoruz
        logIn("kullanicia@kullanicia.com", "kullanicia.1") // kullanıcıA yı giriş yaptırıyoruz
        onPress() // bu butona tıklandığında dışardan da bi işlem yapılmak isteniyorsa (örneğin loading ekranı gösteriliyor), dışardan gelen fonksiyonu çağırıyoruz
    }

    // kullanıcı test menüsünde kull. b butonuna basıldığında bu fonksiyon çağrılıyor
    function userB() {
        if (auth().currentUser && auth().currentUser.email === "kullanicib@kullanicib.com") return; // eğer zaten bu kullanıcıdaysak bidaha geçmeye uğraşmıyoruz
        logIn("kullanicib@kullanicib.com", "kullanicib.1") // kullanıcıB yi giriş yaptırıyoruz
        onPress() // bu butona tıklandığında dışardan da bi işlem yapılmak isteniyorsa (örneğin loading ekranı gösteriliyor), dışardan gelen fonksiyonu çağırıyoruz
    }

    // kullanıcı test menüsünde şof. a butonuna basıldığında bu fonksiyon çağrılıyor
    function driverA() {
        if (auth().currentUser && auth().currentUser.email === "sofora@sofora.com") return; // eğer zaten bu kullanıcıdaysak bidaha geçmeye uğraşmıyoruz
        logIn("sofora@sofora.com", "sofora.1") // şoförA yi giriş yaptırıyoruz
        onPress() // bu butona tıklandığında dışardan da bi işlem yapılmak isteniyorsa (örneğin loading ekranı gösteriliyor), dışardan gelen fonksiyonu çağırıyoruz
    }

    // kullanıcı test menüsünde şof. b butonuna basıldığında bu fonksiyon çağrılıyor
    function driverB() {
        if (auth().currentUser && auth().currentUser.email === "soforb@soforb.com") return; // eğer zaten bu kullanıcıdaysak bidaha geçmeye uğraşmıyoruz
        logIn("soforb@soforb.com", "soforb.1") // şoförB yi giriş yaptırıyoruz
        onPress() // bu butona tıklandığında dışardan da bi işlem yapılmak isteniyorsa (örneğin loading ekranı gösteriliyor), dışardan gelen fonksiyonu çağırıyoruz
    }

    return (
        <View style={top ? styles.containerTop : styles.containerBottom}>
            <View style={styles.center}>
                <Text style={styles.boldTitle}>KULLANICI TEST MENÜSÜ</Text>
            </View>
            <View style={styles.usersContainer}>
                <DefaultButton selected={user.email === testUsers[0]} style={styles.button} textStyle={styles.buttonText} onPress={userA}>KULL. A</DefaultButton>
                <DefaultButton selected={user.email === testUsers[1]} style={styles.button} textStyle={styles.buttonText} onPress={userB}>KULL. B</DefaultButton>
                <DefaultButton selected={user.email === testUsers[2]} style={styles.button} textStyle={styles.buttonText} onPress={driverA}>ŞOF. A</DefaultButton>
                <DefaultButton selected={user.email === testUsers[3]} style={styles.button} textStyle={styles.buttonText} onPress={driverB}>ŞOF. B</DefaultButton>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    containerTop: {
        position: 'absolute', // konumu diğer komponentlere göre değil sabit belli bir yerde
        backgroundColor: '#000', // arkaplan rengi
        top: 10, // üstten bırakılacak boşluk
        flex: 1, // içinde olduğu komponenti doldur
        width: '70%', // genişlik
        alignSelf: 'center' // kendini hizala
    },
    containerBottom: {
        position: 'absolute', // konumu diğer komponentlere göre değil sabit belli bir yerde
        bottom: 10, // konumuna altan bu kadar ekle
        backgroundColor: '#000', // arkaplan rengi
        flex: 1, // içinde olduğu komponenti doldur
        width: '70%', // genişlik
        alignSelf: 'center' // kendini hizala
    },
    button: {
        flex: 1, // içinde olduğu komponenti doldur
    },
    buttonText: {
        fontSize: 16
    },
    center: {
        flex: 1, // içinde olduğu komponenti doldur
        flexDirection: 'column', // içindeki elemanların diziliş yönü
        alignItems: 'center', // içindeki elemanları hizala
        backgroundColor: '#000', // arkaplan rengi
        padding: 8, // kendi içinde içten boşluk
        borderBottomColor: '#FFCC00',
        borderBottomWidth: 2 // alttan çizginin kalınlığı
    },
    boldTitle: {
        color: '#FFCC00', // yazı rengi
        fontWeight: 'bold', // yazı kalınlığı
        fontSize: 16
    },
    usersContainer: {
        flex: 1, // içinde olduğu komponenti doldur
        flexDirection: 'row', // içindeki elemanların diziliş yönü
    }
})