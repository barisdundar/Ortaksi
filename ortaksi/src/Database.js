import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { mesafeİçinÜcretHesapla } from './Utils';


// uygulama genelinde çağırdığımız veritabanında düzenleme yapmaya yarayan fonksiyonlar bu dosyada

// kullanıcı bir yere gitme istediğini onayladığında (yolculuk başlangıcı)
// bu fonksiyona yolculuğun bilgisi geldi
function hedefKonumuKabulEtti({ type, onlySameGender, startTime = null, start, end, distance, duration, destinationAddress }) {
    // asenkron bi işlem yapıyoruz o yüzden Promise kullanıyoruz
    /**
        asenkron işlem:
            kendi threadı varmış gibi çalışıp uygulamanın genelini bloklamadan
            işlerini yapıp sonra sonucu döndüren şey
     */
    return new Promise((resolve, reject) => {
        firestore() // veritabanımıza
            .collection('requests') // isteklerin olduğu koleksiyona
            .add({ // yeni bir istek ekliyoruz
                type: type, // isteğin tipi (paylaşımlı, randevu, bireysel)
                onlySameGender: onlySameGender, // sadece aynı cinsiyetten kişilerle mi gitmek istiyor
                startTime: startTime ? startTime.getTime() : null, // randevulu ise başlangıç zamanı
                start: new firestore.GeoPoint(start.latitude, start.longitude), // başlangıç konumu
                end: new firestore.GeoPoint(end.latitude, end.longitude), // bitiş konumu
                price: mesafeİçinÜcretHesapla(distance), // ücreti
                duration: duration, // süresi
                distance: distance, // mesafesi
                destinationAddress: destinationAddress, // hedef adresi
                user: firestore().collection('users').doc(auth().currentUser.uid), // bu isteğin sahibi olan kullanıcı (aktif olarak giriş yapmış kullanıcı)
            })
            .then((doc) => { // başarıyla ekledikten sonra
                firestore() // veritabanımızda
                    .collection('users') // kullanıcılar koleksiyonunda
                    .doc(auth().currentUser.uid) // aktif giriş yapmış kullanıcının dökümanına gidip
                    .update({
                        // aktif isteğini bize uyan istek varsa o veya bu yeni eklediğimiz isteğin dökümanı yapıyoruz
                        activeRequest: doc
                    })
                    .then(() => resolve(doc)) // fonksiyonu bitiriyoruz
                    .catch(error => reject(error)) // hata varsa fonksiyonu hatalı bitiriyoruz
            })
            .catch(error => reject(error)); // hata varsa fonksiyonu hatalı bitiriyoruz
    })
}

// kullanıcı taksiyi beklerken, taksiciyi kabul etmeden önce isteğini iptal ederse
// taksi bekleniyor ken iptal
function taksiBeklerkenİptal() {
    return new Promise((resolve, reject) => {
        firestore()
            .collection('users') // kullanıcılar koleksiyonunda
            .doc(auth().currentUser.uid) // aktif giriş yapmış kullanıcının 
            .get({ source: 'server' }) // verisini serverden çekiyoruz
            .then(async (doc) => {
                const data = doc.data(); // verisini okuyoruz

                if (data.activeRequest) { // eğer verisinde aktif istek varsa (kontrol)
                    // aktif isteğinin verisini çekiyoruz 
                    const activeRequestData = (await data.activeRequest.get({ source: 'server' })).data();

                    // aktif isteğini siliyoruz 
                    data
                        .activeRequest
                        .delete()
                        .then(() => {
                            doc.ref.update({ activeRequest: null }) // aktif isteğini siliyoruz

                            return resolve(activeRequestData); // başarılı şekilde bitiriyoruz
                        })
                        .catch(error => reject(error)) // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
                }
            })
            .catch(error => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
    })
}

// kullanıcı gelen taksiciyi kabul ederse
// taksici kabul et e bastığında çağrılıyor
function taksiciyiKabulEt(istekId) {
    return new Promise((resolve, reject) => {
        firestore()
            .collection("requests") // veritabanımızda istekler tablosunda
            .doc(istekId) // bize verilen isteğe gidiyoruz
            .update({
                accepted: true // kabuledildimi = true olarak güncelliyoruz
            })
            .then(() => resolve()) // başarılı şekilde bitiriyoruz
            .catch(error => reject(error)) // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
    })
}

// kullanıcı gelen taksiciyi reddederse
function istektekiTaksiciyiReddet(istekId) {
    return new Promise((resolve, reject) => {
        firestore()
            .collection("requests") // istekler koleksiyonunda
            .doc(istekId) // bize verilen isteğe gidiyoruz
            .get({ source: 'server' }) // serverden verisini çekiyoruz 1 seferlik
            .then((doc) => {
                const data = doc.data(); // verisini okuyoruz
                const driverId = data.driver.id; // istekteki şoförün idsini kaydediyoruz

                if (data.rejected) { // eğer istekte reddedilen şoförler dizisi varsa
                    doc.ref.update({ driver: null, rejected: [...data.rejected, driverId] }) // istekteki şoförü yok ediyoruz ve o diziye şoförü ekliyoruz (şoför reddedilmiş oldu)
                }
                else {
                    doc.ref.update({ driver: null, rejected: [driverId] }) // istekteki şoförü yok ediyoruz ve yeni bir reddedilmiş şoförler dizisi oluşturup tek eleman olarak bu şoförün id sini veriyoruz
                }

                firestore()
                    .collection("users") // kullanıcılar koleksiyonuna gidip
                    .doc(driverId) // bu şoföre gidip
                    .update({
                        activeRequest: 'rejected' // aktif isteğini reddedildi olarak değiştiriyoruz
                    })
                    .then(() => resolve()) // başarılı şekilde bitiriyoruz dışardan .then ile yakalıyorlar
                    .catch(error => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz

            })
            .catch(error => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
    })
}

// yolculuk tamamlandığında
function yolculuğuTamamla({ istekId, driverId }) {
    return new Promise((resolve, reject) => {
        firestore()
            .collection('requests') // istekler koleksiyonuna gidiyoruz
            .doc(istekId) // bu isteğe gidiyoruz
            .get({ source: 'server' }) // verisini serverden çekiyoruz
            .then((doc) => {
                const data = doc.data(); // verisini okuyoruz

                // istek tamamlandığı için bu isteği veritabanından siliyoruz 
                doc.ref
                    .delete() // sildik
                    .then(() => { // sildikten sonra
                        if (data.type === "paylasimli") { // eğer istek paylaşımlı ise diğer kullanıcıyı da güncelliyoruz
                            firestore()
                                .collection("users") // kullanııclar koleksiyonunda
                                .doc(data.otherUser.id) // diğer kullanıcıya gidip
                                .update({
                                    activeRequest: "done", // aktif isteğinin bittiğini söylüyoruz
                                    usersToRate: [data.user.id, driverId] // ana kullanıcıyı ve şoförü oylaması gerektiğini belirtiyoruz
                                });
                        }

                        firestore()
                            .collection("users") // kullanıcılar koleksiyonunda
                            .doc(auth().currentUser.uid) // ana kullanıcıya gidip
                            .update({
                                activeRequest: "done", // aktif isteğinin bittiğini söylüyoruz
                                // eğer isteği paylaşımlı ise diğer kullanıcıyı ve şoförü, eğer değilse sadece şoförü oylamasını söylüyoruz
                                usersToRate: data.type === "paylasimli" ? [data.otherUser.id, driverId] : [driverId]
                            });

                        firestore()
                            .collection("users") // kullanıcılar koleksiyonunda
                            .doc(driverId) // şoföre gidip
                            .update({
                                activeRequest: "done" // aktif isteğinin bittiğini belirtiyoruz
                            });

                        return resolve(); // başarılı şekilde bitiriyoruz dışardan .then ile yakalıyorlar
                    })
                    .catch(error => reject(error)) // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
            })
    })
}

// kullanıcı başkasının isteğine sonradan katılırsa bu fonksiyonu çağırarak katılıyor
function isteğeKatıl({ matchingRequestId, start, end }) {
    return new Promise((resolve, reject) => {
        firestore()
            .collection('requests') // isteklerde
            .doc(matchingRequestId) // bize uyan isteğe gidip
            .update({
                otherUser: firestore().collection('users').doc(auth().currentUser.uid), // diğer kullanıcı olarak kendimizi ekliyoruz
                isOtherUserAccepted: false, // ilk başta kendimizi kabul edilmedik ana kullanıcı tarafından olarak ekliyoruz
                otherUserStart: new firestore.GeoPoint(start.latitude, start.longitude), // başlangıç noktamız
                otherUserEnd: new firestore.GeoPoint(end.latitude, end.longitude)  // bitiş noktamız
            })
            .then(() => {
                firestore() // veritabanımızda
                    .collection('users') // kullanıcılar koleksiyonunda
                    .doc(auth().currentUser.uid) // aktif giriş yapmış kullanıcının dökümanına gidip
                    .update({
                        // aktif isteğini bize uyan istek varsa o veya bu yeni eklediğimiz isteğin dökümanı yapıyoruz
                        activeRequest: firestore().collection('requests').doc(matchingRequestId)
                    })
                    .then(() => resolve()) // fonksiyonu bitiriyoruz
                    .catch(error => reject(error)) // hata varsa fonksiyonu hatalı bitiriyoruz
            }) // başarılı şekilde bitiriyoruz dışardan .then ile yakalıyorlar
            .catch(error => reject(error)) // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
    });
}

// bir paylaşımlı istekteki diğer kullanıcıyı reddetmek için bu fonksiyon çağrılıyor
function istektekiDiğerKullanıcıyıReddet(istekId) {
    return new Promise((resolve, reject) => {
        firestore()
            .collection('requests') // istekler koleksiyonunda
            .doc(istekId) // verilen isteğe gidip
            .get({ source: 'server' }) // serverden verisini çekip
            .then(async (doc) => {
                const data = doc.data(); // verisini okuyup

                await data.otherUser.update({
                    activeRequest: null
                });

                await doc.ref.update({
                    otherUser: null, // isteğimizdeki diğer kullanıcıyı yok ediyoruz reddettiğimiz için
                    otherUserStart: null,
                    otherUserEnd: null
                });

                return resolve(); // başarılı şekilde bitiriyoruz dışardan .then ile yakalıyorlar
            })
            .catch(error => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
    })
}

// şoför bir isteği kabul ettiğinde
function şoförİstekKabulEtti({ istekId, region, type }) {
    return new Promise((resolve, reject) => {
        firestore()
            .collection('requests') // istekler koleksiyonunda
            .doc(istekId) // verilen isteğe gidip
            .update({
                driver: firestore().collection('users').doc(auth().currentUser.uid), // şoförüne bu şoförü ekliyoruz
                accepted: false
            })
            .then(() => {
                firestore()
                    .collection('users') // istekler koleksiyonunda
                    .doc(auth().currentUser.uid) // aktif giriş yapmış kullanıcıya yani şoföre gidip
                    .update({
                        activeRequest: firestore().collection('requests').doc(istekId), // aktif isteğini kabul ettiği istek yapıyoruz
                        location: new firestore.GeoPoint(region.latitude, region.longitude) // kullanıcılar bu şoförü haritada görsün diye konumunu güncelliyoruz 1 seferlik
                    })
                    .then(() => {
                        return resolve(); // başarılı şekilde bitiriyoruz dışardan .then ile yakalıyorlar
                    })
                    .catch(error => {
                        return reject(error); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
                    })
            })
            .catch(error => reject(error)) // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
    })
}

function diğerKullanıcıİptalEtti(istekId) {
    return new Promise((resolve, reject) => {
        istekVerisiniAl(istekId)
            .then((doc) => {
                const docData = doc.data();

                aktifİsteğiYokEt()
                    .then(() => {
                        doc.ref
                            .update({
                                otherUser: null,
                                otherUserStart: null,
                                otherUserEnd: null,
                                isOtherUserAccepted: false
                            })
                            .then(() => resolve()) // başarılı şekilde bitiriyoruz dışardan .then ile yakalıyorlar
                            .catch(error => reject(error)) // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
                    })
                    .catch((error) => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
            })
            .catch(error => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
    })
}

// bir isteğin verisini 1 seferlik almak için
function istekVerisiniAl(istekId) {
    return firestore()
        .collection('requests') // istekler koleksiyonuna gidpi
        .doc(istekId) // istenen isteğin dökümanını
        .get({
            source: 'server' // serverden çekip döndürüyoruz
        });
}

// şuanki şoför olduğu randevulu istekten çıkmak istediğinde bu fonksiyon çağrılıyor
function şoförRandevuİptalEtti(istekId) {
    return new Promise((resolve, reject) => {
        firestore()
            .collection("requests") // istekler koleksiyonunda
            .doc(istekId) // verilen isteğe gidip
            .get({ source: 'server' }) // verisini çekip
            .then((doc) => {
                const data = doc.data(); // verisini okuyoruz
                const driverId = data.driver.id; // şoförü kaydediyoruz

                if (data.rejected) {
                    doc.ref.update({ accepted: false, driver: null, rejected: [...data.rejected, driverId] })
                }
                else {
                    doc.ref.update({ accepted: false, driver: null, rejected: [driverId] })
                }

                firestore()
                    .collection("users")
                    .doc(driverId)
                    .update({
                        activeRequest: null
                    })
                    .then(() => resolve()) // başarılı şekilde bitiriyoruz dışardan .then ile yakalıyorlar
                    .catch(error => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
            })
            .catch(error => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
    })
}

// şuanki kullanıcının aktif isteğini yok etmek için
function aktifİsteğiYokEt() {
    return firestore()
        .collection("users") // kullanıcılar koleksiyonunda
        .doc(auth().currentUser.uid) // şuanki giriş yapmış kullanıcıya ulaşıp
        .update({
            activeRequest: null // aktif isteğini yok ediyoruz
        });
}

// bir kullanıcıya puan eklerken bu fonksiyon çağrılıyor
// userId = puan eklenecek kişi
// rate = eklenecek puan miktarı
function puanEkle(userId, rate) {
    return new Promise((resolve, reject) => {
        firestore()
            .collection('users') // kullanıcılara gidiyoruz
            .doc(userId) // verilen kullanıcıya gidiyoruz
            .get({ source: 'server' }) // verisini çekiyoruz
            .then((doc) => {
                const data = doc.data(); // verisini okuyoruz

                doc.ref
                    .update({ // verisini güncelliyoruz
                        ratedUsersCount: data.ratedUsersCount ? (data.ratedUsersCount + 1) : 1, // daha önceden oylayan kullanıcı sayısı varsa 1 ekliyoruz yoksa 1 den başlatıyoruz
                        rate: data.rate ? (data.rate + rate) : rate // daha önceden puanı varsa verilen puanı ekliyoruz, yoksa verilen puandan başlatıyoruz
                    })
                    .then(() => { // puanı ekledikten, oy veren kişi sayısını arttırdıktan sonra
                        // bu kısımda oy veren kullanıcının oy verceği kişilerden bu oy verdiği kişiyi çıkarıyoruz
                        firestore()
                            .collection("users") // kullanıcılara gidiyoruz
                            .doc(auth().currentUser.uid) // aktif giriş yapmış kullanıcıya ulaşıyoruz
                            .get({ source: "server" }) // verisini çekiyoruz
                            .then((doc) => {
                                const data = doc.data(); // verisini okuyoruz

                                // puanlayacağı kullanıcıları filtreliyoruz ve puan verdiği kişiyi çıkartıyoruz
                                data.usersToRate = data.usersToRate.filter((id) => id != userId);

                                doc.ref
                                    .update({
                                        usersToRate: data.usersToRate // veritabanını güncelleyip oy verceği kişileri güncelliyoruz
                                    })
                                    .then(() => resolve()) // başarılı şekilde bitiriyoruz dışardan .then ile yakalıyorlar
                                    .catch(error => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
                            })
                    })
                    .catch(error => reject(error)); // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
            })
            .catch(error => reject(error)) // hata varsa fonksiyonu dışardan .catch ile yakalanacak şekilde hata ile bitiriyoruz
    });
}

// fonksiyonlarımızı dışarda kullanılmak üzere çıkartıyoruz
export default {
    hedefKonumuKabulEtti,
    taksiBeklerkenİptal,
    istektekiTaksiciyiReddet,
    yolculuğuTamamla,
    taksiciyiKabulEt,
    şoförİstekKabulEtti,
    istekVerisiniAl,
    aktifİsteğiYokEt,
    isteğeKatıl,
    istektekiDiğerKullanıcıyıReddet,
    diğerKullanıcıİptalEtti,
    şoförRandevuİptalEtti,
    puanEkle
}