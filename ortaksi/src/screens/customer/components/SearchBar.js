import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import SearchBarRightButton from '../../../components/SearchBarRightButton';
import { GOOGLE_MAPS_APIKEY } from '../../../Consts';

// ekranın üstündeki bir yer arama bölümünün komponenti
// hedef yer seçildiğinde çağrılacak fonksiyonu alıyor
export default function SearchBar({ onTargetLocationSelected }) {
    return (
        <GooglePlacesAutocomplete
            placeholder='Nereye gideceksin?' // arama barında yazan yazı
            textInputProps={{ placeholderTextColor: '#FFCC00', selectionColor: '#FFCC00' }} // arama barındaki yazının rengi
            enablePoweredByContainer={false} // arama barının altında powered by google yazısı çıkmaması için
            styles={inputStyle}
            fetchDetails // seçilen yerin detaylarını istediğimizi bildiriyoruz
            onPress={onTargetLocationSelected} // bir yer seçildiğinde bu fonksiyon çağrılacak
            query={{
                key: GOOGLE_MAPS_APIKEY, // cloud consoleden aldığımız api keyi girdik
                language: 'tr', // dilimiz türkçe
                components: 'country:tr' // ülkemiz türkiye
            }}
            renderRightButton={SearchBarRightButton} // arama barının sağında çıkan 3 çizgili butonu göstermek için buraya veriyoruz
        />
    );
}

const inputStyle = {
    container: {
        position: 'absolute', // konumu diğer komponentlere göre değil sabit belli bir yerde
        top: 15, // üstten bırakılacak boşluk
        width: '100%', // genişlik
        flex: 1
    },
    textInputContainer: {
        flex: 1, // içinde olduğu komponenti doldur
        backgroundColor: 'transparent', // arkaplan rengi
        height: 54, // yükseklik
        marginHorizontal: 20,
        borderTopWidth: 0, // üst kısmındaki çizginin kalınlığı
        borderBottomWidth: 0, // alttan çizginin kalınlığı
    },
    textInput: {
        height: 54, // yükseklik
        margin: 0, // etrafına boşluk
        borderRadius: 0,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 0,
        marginLeft: 0, // dış soldan boşluk
        marginRight: 0,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { x: 0, y: 0 },
        shadowRadius: 15,
        borderWidth: 3,
        borderColor: '#FFCC00',
        fontSize: 18,
        backgroundColor: '#000', // arkaplan rengi
        color: '#FFCC00' // yazı rengi
    },
    listView: {
        borderWidth: 2,
        borderColor: '#FFCC00',
        backgroundColor: '#000', // arkaplan rengi
        marginHorizontal: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { x: 0, y: 0 },
        shadowRadius: 15,
        marginTop: 10,
    },
    description: {
        fontSize: 16,
        color: '#FFCC00' // yazı rengi
    },
    row: {
        padding: 18, // kendi içinde içten boşluk
        height: 58, // yükseklik
        backgroundColor: '#000'
    },
};