import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-community/picker';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from "react-native";
import DefaultButton from '../../../components/DefaultButton';

/*
    arama barından bir yer seçilip sonra onayla butonuna basıldığında ekrana çıkan-
    bireysel, paylaşımlı, randevu lu seçeneklerini gösteren ve o seçeneklerin de ayarlarını gösteren arayüz

    ayarlar tamamlanıp onaylandığında çağrılacak fonksiyonu, iptal edildiğinde çağrılacak fonksiyonu alıyor
*/
export default function SettingsModal({ onTargetLocationAccept, onTargetLocationCancel }) {
    const [type, setType] = useState('bireysel'); // isteğin tipi, varsayılan olarak bireysel (bireysel, paylasimli, randevu dan herhangi biri olabilir)
    const [onlySameGender, setOnlySameGender] = useState(false); // sadece aynı cinsiyetten kişilerle gitmek istenip istenmediği
    const [showTimePicker, setShowTimePicker] = useState(false); // randevu saati seçme arayüzünün görünür olup olmadığı
    const [selectedTime, setSelectedTime] = useState(null); // randevu saati seçme arayüzünden seçilen saat

    // verilen bir tarihin uygun olup olmadığını kontrol eden fonksiyon
    function tarihGecerliMi(tarih) {
        if (!tarih) return false; // eğer tarih verilmediyse uygun değildir

        if (tarih < new Date()) { // verilen tarih olduğumuz tarihten öncesindeyse 
            return false; // uygun değildir
        }

        return true; // kalan herşeyde uygundur
    }

    return (
        <Modal transparent>
            <View style={styles.settingsModal}>
                <View style={styles.settingsContainer}>
                    <View>
                        <Text style={styles.text}>Nasıl gitmek istiyorsun?</Text>
                        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#ffcc00', marginTop: 8 }}>
                            <Picker style={styles.picker} selectedValue={type} onValueChange={(itemValue, itemIndex) =>
                                // isteğin tipi seçildiğinde (bireysel, paylasimli, randevu dan herhangi biri olabilir)
                                setType(itemValue)
                            }>
                                <Picker.Item label="Bireysel" value="bireysel" />
                                <Picker.Item label="Paylaşımlı" value="paylasimli" />
                                <Picker.Item label="Randevu" value="randevu" />
                            </Picker>
                        </View>
                    </View>
                    {
                        // eğer seçilen tip paylaşımlı tip ise, sadece kendi cinsiyetim kısmını gösteriyoruz
                        type === "paylasimli" && (
                            <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                <CheckBox
                                    value={onlySameGender}
                                    onValueChange={(newValue) => setOnlySameGender(newValue)} // sadece kendi cinsiyetim seçimi değiştiğinde onlySameGender isimli state yi güncelliyoruz
                                    tintColors={{ true: '#ffcc00', false: '#ffcc00' }}
                                />
                                <Text style={{ color: '#fff', textAlignVertical: 'center', color: '#ffcc00' }}>Sadece kendi cinsiyetim</Text>
                            </View>
                        )
                    }
                    {
                        // eğer seçilen tip randevu tipiyse randevu vakti seçim kısımlarını gösteriyoruz
                        type === "randevu" && (
                            <View>
                                <View style={{ marginTop: 8 }}>
                                    <Text>
                                        <Text style={{ fontSize: 16, color: '#ffcc00', fontWeight: 'bold' }}>Randevu Vakti: </Text>
                                        <Text style={{ fontSize: 16, color: '#ffcc00' }}>
                                            {
                                                // bir vakit seçildiyse vaktin stringe çevrilmiş halini göster, seçilmediyse seçilmediğini göster
                                                selectedTime ? selectedTime.toLocaleTimeString() : "Seçilmedi"
                                            }
                                        </Text>
                                    </Text>
                                </View>
                                <View style={{ marginTop: 8, flexDirection: 'row' }}>
                                    <DefaultButton style={{ flex: 1 }} selected onPress={() => {
                                        // vakit seç butonuna tıklandığında vakit seçme arayüzünün görünür olmasını true yapıyoruz yani vakit seçme arayüzünü gösteriyoruz
                                        setShowTimePicker(true);
                                    }}>VAKİT SEÇ</DefaultButton>
                                </View>

                                {
                                    // vakit seçme arayüzü gösterilmesi isteniyorsa gösteriyoruz
                                    showTimePicker && <DateTimePicker
                                        mode="time" // saat seçme modunda olacak
                                        minimumDate={new Date()} // minimum vakit olduğumuz vakit olacak yani olduğumuz vakitten öncesi seçilemeyecek
                                        value={new Date()} // vaktin varsayılan değeri şuanki vakit olacak
                                        minuteInterval={5} // 1 saat 5 dakika aralıklara bölünecek, 5 10 15 20 şeklinde gözükecek saat içindeki dakikalar
                                        is24Hour={true} // 24 saatlik bir saat mi evet
                                        display="default" // varsayılan şekilde gösterilecek
                                        onChange={(event, selectedDate) => {
                                            // vakit seçildiğinde bu fonksiyon çağrılıyor
                                            if (tarihGecerliMi(selectedDate)) { // eğer seçilen vakit uygunsa
                                                setSelectedTime(selectedDate); // seçilen vakit state sini güncelliyoruz
                                                setShowTimePicker(false); // vakit seçme arayüzünün görünürlüğünü false yani gizli yapıyoruz
                                            }
                                            else { // eğer seçilen vakit uygun değilse
                                                // hata mesajını göster
                                                Alert.alert("Hata", "Seçtiğiniz saat uygun değil (muhtemelen önceki bir saate seçtiniz). Lütfen farklı bir saat seçin.");
                                                setShowTimePicker(false); // vakit seçme arayüzünü gizle
                                            }
                                        }}
                                    />
                                }
                            </View>
                        )
                    }
                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                        <DefaultButton style={{ flex: 1 }} onPress={() => {
                            // ayarlar doldurulup onayla butonuna basıldığında bu fonksiyon çağrılıyor
                            if (type === "randevu") { // eğer gidiş tipi randevuluysa
                                if (!tarihGecerliMi(selectedTime)) { // eğer seçilen vakit uygun değilse
                                    Alert.alert("Hata", "Seçtiğiniz saat uygun değil. Lütfen farklı bir saat seçin."); // hata mesajı göster
                                    return;
                                }
                            }

                            // bu komponente props da verilen onayla butonuna basıldığında çağrılacak fonksiyonu çağırıyoruz
                            // çağırırken doldurulan ayarları da veriyoruz (gidiş tipi, sadece kendi cinsiyetinle mi, seçilen vakit)
                            onTargetLocationAccept({ type, onlySameGender, selectedTime })

                        }}>ONAYLA</DefaultButton>
                        <DefaultButton style={{ flex: 1 }} onPress={
                            // bu komponente props da verilen iptal tuşuna basıldığında çağrılacak fonksiyonu çağırıyoruz
                            onTargetLocationCancel
                        }>İPTAL</DefaultButton>
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