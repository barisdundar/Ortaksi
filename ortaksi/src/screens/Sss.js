import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SSS() {
    return <View style={{ backgroundColor: '#000', height: '100%' }}>
        <Text style={styles.title}>Sıkça Sorulan Sorular</Text>
        <View style={styles.viewStyle}>
            <Text style={styles.question}>• 60 dakika kaladan önce randevulu istek iptal edilirse ne olur?</Text>
            <Text style={styles.answer}>Online ödeme yöntemiyle yapılacak tüm ödemelerde 10TL ceza kesimi uygulanır.</Text>
        </View>
        <View style={styles.viewStyle}>
            <Text style={styles.question}>• Uygulamada ne tür kullanım yöntemleri var?</Text>
            <Text style={styles.answer}>Uygulama bireysel, paylaşımlı, randevulu şekillerde kullanılabilir.</Text>
        </View>
        <View style={styles.viewStyle}>
            <Text style={styles.question}>• Randevu saatleri için limit nedir?</Text>
            <Text style={styles.answer}>Aynı gün içerisindeki sonraki saatlere alınabilir.</Text>
        </View>
        <View style={styles.viewStyle}>
            <Text style={styles.question}>• Paylaşımlı kullanım nedir?</Text>
            <Text style={styles.answer}>Paylaşımlı kullanım yakın başlangıç konumlarındaki kullanıcıların yine yakın hedeflere gidecekleri zaman birlikte gidip ücreti yarı yarıya ödemeleri şeklinde olur.</Text>
        </View>
    </View>;
}

const styles = StyleSheet.create({
    title: {
        alignSelf: 'center', // kendini hizala
        textAlign: 'center', // yazıyı hizala
        fontSize: 24,
        marginTop: 16, // dış yukardan boşluk
        marginBottom: 14, // dış aşşağıdan boşluk
        fontWeight: 'bold', // yazı kalınlığı
        color: '#ffcc00' // yazı rengi
    },
    viewStyle: {
        paddingLeft: 16, // içten boşluk sol taraftan
        padding: 8, // içten boşluk her taraftan
        marginBottom: 4, // alttan boşluk dıştan
        color: '#ffcc00' // yazı rengi
    },
    question: {
        fontWeight: 'bold', // font kalınlığı
        fontSize: 17,
        color: '#ffcc00' // yazı rengi
    },
    answer: {
        fontSize: 15,
        color: '#ffcc00' // yazı rengi
    }
});