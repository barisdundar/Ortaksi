import auth from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import ChangeUser from '../../components/ChangeUser';
import DefaultButton from '../../components/DefaultButton';
import Input from '../../components/Input';

// şoförün giriş sayfası
// prop larda sayfalar arasında geçiş yapmayı sağlayan navigation nesnesini alıyor
export default function Login({ navigation }) {
    const [email, setEmail] = useState(""); // email girişine girilen emaili tutan state
    const [password, setPassword] = useState(""); // şifre girişine girilen şifreyi tutan state

    return (
        <View style={{ height: '100%' }}>
            <View style={styles.container}>
                <View style={styles.verticalContainer}>
                    <View style={{ marginBottom: 64 }}>
                        <Image source={require('../../assets/images/logo.png')} />
                    </View>
                    <View style={{ marginBottom: 30 }}>
                        <Text style={styles.boldTitle}>
                            Şoför Girişi
                        </Text>
                    </View>
                    <View style={{ marginBottom: 12 }}>
                        <Input placeholder="Email" onChangeText={
                            // email girişine girilen email değiştiğinde ilgili state yi güncelliyoruz
                            email => setEmail(email)
                        } />
                        <Input
                            placeholder="Şifre"
                            secureTextEntry={true} // şifre girişindeki şifre gözükmemesi için
                            style={{ top: -1 }}
                            onChangeText={
                                // şifre girişine girilen şifre değiştiğinde ilgili state yi güncelliyoruz
                                password => setPassword(password)
                            } />
                    </View>
                    <View>
                        <DefaultButton style={{ width: 262 }} onPress={() => {
                            // giriş butonuna tıklandığında bu fonksiyon çağrılıyor

                            // eğer email ya da şifre uzunluğu sıfırsa yani girilmediyse
                            if (email.length == 0 || password.length == 0) {
                                Alert.alert('Hata', 'Girişler boş olamaz!')
                                return;
                            }

                            auth()
                                .signInWithEmailAndPassword(email, password) // girilen email ve şifre ile giriş yapmayı deniyoruz
                                .then(() => {
                                    console.log("User with email '" + email + "' logged in!"); // giriş yapabildiysek konsola bunu yazdırıyoruz
                                })
                                .catch(error => {
                                    console.log(error); // giriş yapamadıysak hatayı konsola yazdırıyorouz
                                    Alert.alert('Hata', 'E-posta ya da şifre hatalı!');  // ve de hata mesajını kullanıcıya gösteriyoruz
                                });
                        }}>GİRİŞ</DefaultButton>
                    </View>
                </View>

                <View style={{
                    position: 'absolute', // konumu diğer komponentlere göre değil sabit belli bir yerde
                    bottom: 24
                }}>
                    <DefaultButton
                        style={{ width: 262, height: 33 }}
                        onPress={() => {
                            // kayıt ol butonuna basıldığında bu fonksiyon çağrılıyor
                            navigation.navigate('Driver Register') // şoför kayıt sayfasını açıyoruz
                        }}
                    >KAYIT OL</DefaultButton>
                </View>
            </View>
            <ChangeUser top={true} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // içinde olduğu komponenti doldur
        flexDirection: 'row', // içindeki elemanların diziliş yönü
        alignItems: 'center', // içindeki elemanları hizala
        justifyContent: 'center',
        width: '100%', // genişlik
        height: '100%' // yükseklik
    },
    verticalContainer: {
        flex: 1, // içinde olduğu komponenti doldur
        flexDirection: 'column', // içindeki elemanların diziliş yönü
        width: '100%', // genişlik
        alignItems: 'center' // içindeki elemanları hizala
    },
    input: {
        borderWidth: 2,
        borderColor: '#000',
        padding: 8, // kendi içinde içten boşluk
        fontSize: 20,
        width: 260 // genişlik
    },
    button: {
        backgroundColor: '#000', // arkaplan rengi
        padding: 10, // kendi içinde içten boşluk
        width: 223, // genişlik
        display: 'flex',
        flexDirection: 'column', // içindeki elemanların diziliş yönü
        alignItems: 'center' // içindeki elemanları hizala
    },
    buttonText: {
        color: '#ffcc00', // yazı rengi
        fontWeight: 'bold', // yazı kalınlığı
        fontSize: 18
    },
    boldTitle: {
        fontWeight: 'bold', // yazı kalınlığı
        fontSize: 25,
    }
})