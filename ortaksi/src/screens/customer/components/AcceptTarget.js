import React from 'react';
import { StyleSheet, Text, View } from "react-native";
import DefaultButton from '../../../components/DefaultButton';
import { mesafeİçinÜcretHesapla } from '../../../Utils';

// arama barından bi hedef arandığında aşağıda çıkan onayla iptal komponenti
// hedef adresi, mesafeyi, süreyi, onaylandığında çağrılacak fonksiyonu, iptal edildiğinde çağrılacak fonksiyonu alıyor
export default function AcceptTarget({ targetAddress, distance, duration, onAccept, onCancel }) {
    return (
        <View style={styles.container}>
            <View style={{ margin: 8 }}>
                <Text style={{ color: '#ffcc00' }}>{targetAddress}</Text>
                <Text>
                    <Text style={{ color: '#ffcc00', fontWeight: 'bold' }}>Mesafe ve süre: </Text>
                    <Text style={{ color: '#ffcc00' }}>{distance.toFixed(2)}km ({duration.toFixed(1)}dk)</Text>
                </Text>
                <Text>
                    <Text style={{ color: '#ffcc00', fontWeight: 'bold' }}>Tahmini ücret: </Text>
                    <Text style={{ color: '#ffcc00' }}>{mesafeİçinÜcretHesapla(distance)}₺</Text>
                </Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <DefaultButton style={styles.button} textStyle={styles.buttonText} onPress={onAccept}>ONAYLA</DefaultButton>
                <DefaultButton style={styles.button} textStyle={styles.buttonText} onPress={onCancel}>İPTAL</DefaultButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute', // konumu diğer komponentlere göre değil sabit belli bir yerde
        bottom: '14%', // konumuna altan bu kadar ekle
        flex: 1, // içinde olduğu komponenti doldur
        alignSelf: 'center', // kendini hizala // kendini hizala
        backgroundColor: '#000', // arkaplan rengi
        width: '75%' // genişlik
    },
    button: {
        flex: 1, // içinde olduğu komponenti doldur
        borderTopWidth: 2, // üst kısmındaki çizginin kalınlığı
        borderTopColor: '#ffcc00' // üst kısmındaki çizginin rengi
    },
    buttonText: {
        fontSize: 16
    }
})