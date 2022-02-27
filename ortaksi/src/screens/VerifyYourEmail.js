import auth from '@react-native-firebase/auth';
import React from 'react';
import { Alert, StyleSheet, Text, View } from "react-native";
import DefaultButton from '../components/DefaultButton';

// emailinizi doğrulayın ekranı
export default function VerifyYourEmail() {
    return (
        <View style={styles.container}>
            <View style={styles.verticalContainer}>
                <View style={{ marginBottom: 32 }}>
                    <View style={styles.textContainer}>
                        <Text style={{ fontSize: 20, marginBottom: 12 }}>Hesabınızı kullanmadan önce doğrulamanız gerekmektedir.</Text>
                        <Text style={styles.email}>{auth().currentUser.email}</Text>
                    </View>
                </View>
                <DefaultButton
                    style={{ width: '70%' }}
                    onPress={() => { // KOD GÖNDER butonuna tıklandığında bu fonksiyon çağrılıyor
                        auth()
                            .currentUser
                            .sendEmailVerification() // şuanki kullanıcıya email doğrulama kodu gönderiyoruz
                            .then(() => {
                                // gönderdikten sonra uyarı mesajı gösteriyoruz
                                Alert.alert('Başarılı', 'Email doğrulama kodunuz adresinize gönderildi! Lütfen doğrulayıp hesabınıza tekrar giriş yapın.');
                                auth().signOut(); // ve çıkış yapıyoruz
                            })
                            .catch((error) => { // kod gönderirken bi hata olursa burası çağrılıyor
                                if (error.code === 'auth/too-many-requests') { // eğer çok fazla kez denerse bu hatayı gösteriyoruz
                                    Alert.alert('Hata', 'Kod almayı çok fazla kez denediniz! Lütfen emailinize gelen kodu doğrulayıp hesabınıza tekrar giriş yapın.')
                                    auth().signOut(); // çıkış yapıyoruz
                                    return;
                                }

                                console.error(error); // başka hata vasra yazdırıyoruz
                            })
                    }}>KOD GÖNDER</DefaultButton>
            </View>
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
    textContainer: {
        flexDirection: 'column', // içindeki elemanların diziliş yönü
        width: '80%', // genişlik
        alignItems: 'center' // içindeki elemanları hizala
    },
    email: {
        fontWeight: 'bold', // yazı kalınlığı
        fontSize: 20
    }
})