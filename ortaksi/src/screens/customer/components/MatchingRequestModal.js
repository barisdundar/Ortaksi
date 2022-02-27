import React from 'react';
import { Modal, StyleSheet, Text, View } from "react-native";
import DefaultButton from '../../../components/DefaultButton';

// uygun paylaşımlı bir kullanıcı bulunduğunda çıkan arayüz
// paylaşımlı istek kabul edildiğinde çağrılacak fonksiyonu, paylaşımlı istek reddedildiğinde çağrılacak fonksiyonu, paylaşımlı isteğin bilgilerini alıyor
export default function MatchingRequestModal({ onAccept, onReject, userData }) {
    return (
        <Modal transparent>
            <View style={styles.settingsModal}>
                <View style={styles.settingsContainer}>
                    <View>
                        <Text style={styles.text}>Sana uygun bir paylaşımlı kullanıcı bulduk. Beraber gitmeyi kabul ediyor musun? Kabul etmezsen yalnız aramaya devam edilecek. Beraber gidişlerde ücret yarı yarıya ödenir.</Text>
                    </View>
                    <View style={{ marginTop: 8, marginBottom: 8 }}>
                        <View>
                            <Text style={styles.boldText}>Kullanıcının:</Text>
                        </View>
                        <View>
                            <Text>
                                <Text style={styles.boldText}>Adı: </Text>
                                <Text style={styles.text}>{`${userData.name} (${userData.gender === 'male' ? 'Erkek' : 'Kadın'})`}</Text>
                            </Text>
                        </View>
                        <View>
                            <Text>
                                <Text style={styles.boldText}>Puan: </Text>
                                <Text style={styles.text}>{userData.ortalamaRate || "Henüz kimse puan vermemiş."}</Text>
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                        <DefaultButton style={{ flex: 1 }} onPress={onAccept}>ONAYLA</DefaultButton>
                        <DefaultButton style={{ flex: 1 }} onPress={onReject}>REDDET</DefaultButton>
                    </View>
                </View>
            </View>
        </Modal>
    )
}


const styles = StyleSheet.create({
    text: {
        color: '#ffcc00' // yazı rengi
    },
    boldText: {
        color: '#ffcc00', // yazı rengi
        fontWeight: 'bold' // yazı kalınlığı
    },
    settingsModal: {
        backgroundColor: 'rgba(0,0,0,0.7)', // arkaplan rengi
        flex: 1, // içinde olduğu komponenti doldur
        justifyContent: 'center'
    },
    settingsContainer: {
        alignSelf: 'center', // kendini hizala // kendini hizala
        backgroundColor: 'black', // arkaplan rengi
        padding: 8, // kendi içinde içten boşluk
        borderWidth: 2,
        borderColor: '#ffcc00',
        width: '80%' // genişlik
    },
    picker: {
        fontSize: 20,
        flex: 1, // içinde olduğu komponenti doldur
        color: '#ffcc00', // yazı rengi
    }
})