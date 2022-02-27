import { Picker } from '@react-native-community/picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from "react-native";
import DefaultButton from '../../components/DefaultButton';
import Input from '../../components/Input';

// şoför kayıt sayfası
// tamamen müşteri kayıt sayfasıyla aynı, ekstra olarak plaka girişi var
// prop larda sayfalar arasında geçiş yapmayı sağlayan navigation nesnesini alıyor
export default function Register({ navigation }) {
    const [name, setName] = useState(""); // ad alanına girilecek yazıyı tutan state
    const [email, setEmail] = useState(""); // email alanına girilecek yazıyı tutan state
    const [phone, setPhone] = useState(""); // telefon numarası alanına girilecek yazıyı tutan state
    const [plate, setPlate] = useState(""); // plaka alanına girilecek yazıyı tutan state
    const [nationalId, setNationalId] = useState(""); // tc kimlik alanına girilecek yazıyı tutan state
    const [password, setPassword] = useState(""); // şifre alanına girilecek yazıyı tutan state
    const [passwordAgain, setPasswordAgain] = useState(""); // şifre tekrar alanına girilecek yazıyı tutan state
    const [gender, setGender] = useState('male'); // cinsiyet alanına girilecek yazıyı tutan state

    return (
        <View style={styles.container}>
            <View style={styles.verticalContainer}>
                <View style={{ marginBottom: 30 }}>
                    <Text style={styles.boldTitle}>
                        Şoför Kayıt
                    </Text>
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Input // isim girişi
                        placeholder="İsim" // hiçbişey girilmediğinde gözükecek yazı
                        onChangeText={name => setName(name)} // girilen yazı değiştiğinde ad içeren state mizi yeni yazı olacak şekilde güncelliyoruz
                    />
                </View>
                <View style={{ ...styles.border, marginBottom: 12 }}>
                    <Picker // cinsiyet girişi
                        selectedValue={gender} // seçilen değeri ilk baştaki cinsiyet state mizdeki değer yapıyoruz
                        style={styles.picker}
                        onValueChange={(itemValue, itemIndex) =>
                            setGender(itemValue) // seçilen değer değiştiğinde cinsiyet state mizi yeni değer olacak şekilde güncelliyoruz
                        }
                        label="Cinsiyet" // ilk başta seçim yerinde gözükecek yazı
                    >
                        <Picker.Item // seçenek ekliyoruz
                            label="Erkek" // görünen yazısı
                            value="male" // değeri male
                        />
                        <Picker.Item // seçenek ekliyoruz
                            label="Kadın" // görünen yazısı
                            value="female" // değeri femaile
                        />
                    </Picker>
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Input // email girişi
                        placeholder="Email" // hiçbişey girilmediğinde gözükecek yazı
                        onChangeText={email => setEmail(email)} // girilen yazı değiştiğinde ad içeren state mizi yeni yazı olacak şekilde güncelliyoruz
                    />
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Input // tc kimlik girişi
                        placeholder="TC Kimlik No" // hiçbişey girilmediğinde gözükecek yazı
                        onChangeText={nationalId => setNationalId(nationalId)} // girilen yazı değiştiğinde tc kimlik içeren state mizi yeni yazı olacak şekilde güncelliyoruz
                    />
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Input // telefon girişi
                        placeholder="Telefon" // hiçbişey girilmediğinde gözükecek yazı
                        onChangeText={phone => setPhone(phone)} // girilen yazı değiştiğinde telefon numarası içeren state mizi yeni yazı olacak şekilde güncelliyoruz
                    />
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Input placeholder="Plaka" onChangeText={plate => setPlate(plate)} />
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Input // şifre girişi
                        placeholder="Şifre" // hiçbişey girilmediğinde gözükecek yazı
                        secureTextEntry={true} // içeriği gizli olsun nokta şeklinde gözüksün şifre
                        onChangeText={password => setPassword(password)} // girilen yazı değiştiğinde şifre içeren state mizi yeni yazı olacak şekilde güncelliyoruz
                    />
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Input // şifre tekrar girişi
                        placeholder="Şifre Tekrar" // hiçbişey girilmediğinde gözükecek yazı
                        secureTextEntry={true} // içeriği gizli olsun nokta şeklinde gözüksün şifre
                        onChangeText={passwordAgain => setPasswordAgain(passwordAgain)} // girilen yazı değiştiğinde şifre tekrarı içeren state mizi yeni yazı olacak şekilde güncelliyoruz
                    />
                </View>
                <View>
                    <DefaultButton style={{ width: 262 }} onPress={() => {
                        // eğer girişlerden herhangi biri boşsa hata veriyoruz
                        if (name.length == 0 || email.length == 0 || phone.length == 0 || nationalId.length == 0 || password.length == 0) {
                            Alert.alert('Hata', 'Girişler boş olamaz!')
                            return;
                        }

                        // eğer şifremiz şifre tekrarı alanına girilenle aynı değilse
                        if (password !== passwordAgain) {
                            Alert.alert('Hata', 'Şifreler aynı olmalıdır!')
                            return
                        }

                        auth()
                            .createUserWithEmailAndPassword(email, password) // girilen kullanıcı adı ve şifre ile hesap oluşturuyoruz
                            .then(({ user }) => {
                                firestore() // veritabanımızdaki
                                    .collection('users') // kullanıcılar koleksiyonunda
                                    .doc(user.uid) // bu kullanıcının verisini
                                    .set({ // belirliyoruz
                                        email: email, // kullanıcının emaili
                                        name: name, // adı
                                        gender: gender, // cinsiyeti
                                        phone: phone, // telefon numarası
                                        nationalId: nationalId, // kimlik numarası
                                        plate: plate, // plakası
                                        plateVerified: false, // plakası doğrulandı mı
                                        type: "driver" // kullanıcının tipi (şoför)
                                    })
                                    .then(() => { // başarıyla veritabanına kaydettiğimizde
                                        Alert.alert('Başarılı', 'Başarıyla hesap oluşturdunuz!'); // kullanıcıya mesaj gösteriyoruz
                                    })
                                    .catch(error => console.error(error)) // hata varsa yazdırıyoruz
                            })
                            .catch(error => { // hata varsa
                                if (error.code === 'auth/email-already-in-use') { // eğer bu email kullanılıyorsa
                                    Alert.alert('Hata', 'Bu email adresi zaten kullanılıyor!'); // hata mesajı gösteriyoruz
                                    return
                                }

                                if (error.code === 'auth/invalid-email') { // eğer bu geçerli bi email değilse
                                    Alert.alert('Hata', 'Bu email adresi geçerli değil!'); // hata mesajı gösteriyoruz
                                    return
                                }

                                if (error.code === 'auth/weak-password') { // eğer şifre zayıfsa
                                    Alert.alert('Hata', 'Şifre çok zayıf!'); // hata mesajı gösteriyoruz
                                    return
                                }

                                console.error(error) // başka hata varsa yazdırıyoruz
                            });
                    }}>KAYIT OL</DefaultButton>
                </View>
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
    },
    border: {
        borderWidth: 1,
        borderColor: '#000',
    },
    picker: {
        borderWidth: 2,
        borderColor: '#000',
        padding: 8, // kendi içinde içten boşluk
        fontSize: 20,
        width: 260 // genişlik
    }
})