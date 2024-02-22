class Kisi {
    constructor(ad, soyad, mail) {
        this.ad = ad;
        this.soyad = soyad;
        this.mail = mail;

    }
}
class Util {
    static bosAlanKontrolEt(...alanlar) {
        let sonuc = true;
        alanlar.forEach(alan => {
            if (alan.length === 0) {
                sonuc = false;
                return false;
            }
        });
        return sonuc;
    }
    static emailGecerliMi(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
}
class Ekran {
    constructor() {
        this.ad = document.getElementById('ad');
        this.soyad = document.getElementById('soyad');
        this.mail = document.getElementById('mail');
        this.ekleGuncelleButon = document.querySelector('.kaydetGuncelle');
        this.form = document.getElementById('form-rehber');
        this.form.addEventListener('submit', this.kaydetGuncelle.bind(this));
        this.kisiListesi = document.querySelector('.kisi-listesi');
        this.kisiListesi.addEventListener('click', this.guncelleVeyaSil.bind(this));
        this.depo = new Depo();
        //update ve delete butonlarına basıldığında  ilgili tr elementi burada tutulur.
        this.secilenSatir = undefined;
        this.kisileriEkranaYazdir();

    }
    bilgiOlustur(mesaj, durum) {
        const uyariDivi = document.querySelector('.bilgi');
        console.log(uyariDivi)
        uyariDivi.innerHTML = mesaj;
        uyariDivi.classList.add(durum ? 'bilgi--success' : 'bilgi--error');

        setTimeout(function () {
            uyariDivi.className = 'bilgi';
        }, 2000);
    }
    alanlariTemizle() {
        this.ad.value = '';
        this.soyad.value = '';
        this.mail.value = '';
    }
    guncelleVeyaSil(e) {
        const tiklanmaYeri = e.target;
        if (tiklanmaYeri.classList.contains('btn--delete')) {

            this.secilenSatir = tiklanmaYeri.parentElement.parentElement;
            this.kisiyiEkrandanSil();
        } else if (tiklanmaYeri.classList.contains('btn--edit')) {
            this.secilenSatir = tiklanmaYeri.parentElement.parentElement;
            this.ekleGuncelleButon.value = 'Güncelle';
            this.ad.value = this.secilenSatir.cells[0].textContent;
            this.soyad.value = this.secilenSatir.cells[1].textContent;
            this.mail.value = this.secilenSatir.cells[2].textContent;

        }

    }
    kisiyiEkrandaGuncelle(kisi) {
        const sonuc = this.depo.kisiGuncelle(kisi, this.secilenSatir.cells[2].textContent);
        if (sonuc) {
            this.secilenSatir.cells[0].textContent = kisi.ad;
            this.secilenSatir.cells[1].textContent = kisi.soyad;
            this.secilenSatir.cells[2].textContent = kisi.mail;

            this.alanlariTemizle();
            this.secilenSatir = undefined;
            this.ekleGuncelleButon.value = 'Kaydet';
            this.bilgiOlustur('Kişi Güncellendi', true);
        } else {
            this.bilgiOlustur('Yazdıgınız mail kullanımda', false);
        }
    }
    kisiyiEkrandanSil() {
        this.secilenSatir.remove();
        const silinecekMail = this.secilenSatir.cells[2].textContent;
        this.depo.kisiSil(silinecekMail);
        this.alanlariTemizle();
        this.secilenSatir = undefined;
        this.bilgiOlustur('Kişi rehberden silindi', true);

    }
    kisileriEkranaYazdir() {
        this.depo.tumKisiler.forEach(kisi => {
            this.kisiyiEkranaEkle(kisi);
        });
    }
    kisiyiEkranaEkle(kisi) {
        const olusturulanTR = document.createElement('tr');
        olusturulanTR.innerHTML = `<td>${kisi.ad}</td>
        <td>${kisi.soyad}</td>
        <td>${kisi.mail}</td>
        <td>
            <button class="btn btn--edit"> <i class="fa fa-edit" aria-hidden="true"></i></button>
            <button class="btn btn--delete"> <i class="fa fa-trash" aria-hidden="true"></i></button>
    
        </td>`;

        this.kisiListesi.appendChild(olusturulanTR);

    }
    kaydetGuncelle(e) {
        e.preventDefault();
        const kisi = new Kisi(this.ad.value, this.soyad.value, this.mail.value);
        const sonuc = Util.bosAlanKontrolEt(kisi.ad, kisi.soyad, kisi.mail);
        const emailGecerliMi = Util.emailGecerliMi(this.mail.value);
        console.log(this.mail.value + "için email kontrolu sonuc:" + emailGecerliMi);
        // tüm alanlar doldurulmuş 
        if (sonuc) {
            if (!emailGecerliMi) {
                this.bilgiOlustur('Geçerli bir mail yazınız', false);
                return;
            }
            if (this.secilenSatir) {
                //seçilen satır undefined değilse güncellenecek demektir 
                this.kisiyiEkrandaGuncelle(kisi);
            } else {
                // seçilen satır undefinedsa ekleme yapılacaktır
                //yeni kişiyi ekrana ekler
                //localstroga ekle 
                const sonuc = this.depo.kisiEkle(kisi);
                console.log("sonuc:" + sonuc + "kaydet güncelle içinde");
                if (sonuc) {
                    this.bilgiOlustur('Başarıyla eklendi', true);
                    this.kisiyiEkranaEkle(kisi);
                    this.alanlariTemizle();
                } else {
                    this.bilgiOlustur('Bu mail kullanımda', false);
                }
            }

        } else {//bazı alanlar eksik 
            this.bilgiOlustur('Boş alanları doldurunuz', false);
        }
    }
}
class Depo {
    // uyglama ilk açıldığında veriler getirilir
    constructor() {
        this.tumKisiler = this.kisileriGetir();
    }
    emailEssizMi(mail) {
        const sonuc = this.tumKisiler.find(kisi => {
            return kisi.mail === mail;
        });
        //demekki bu maili kullanan biri var 
        if (sonuc) {
            console.log(mail + "kullanımda");
            return false;
        } else {
            console.log(mail + "kullanımda değil ekleme güncelleme yapılabilir");
            return true;
        }
    }
    kisileriGetir() {
        let tumKisilerLocal = [];
        if (localStorage.getItem('tumKisiler') === null) {
            tumKisilerLocal = [];
        } else {
            tumKisilerLocal = JSON.parse(localStorage.getItem('tumKisiler'));
        }
        return tumKisilerLocal;
    }
    kisiEkle(kisi) {

        if (this.emailEssizMi(kisi.mail)) {
            this.tumKisiler.push(kisi);
            localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
            return true;
        } else {
            return false;
        }
    }
    kisiSil(mail) {
        this.tumKisiler.forEach((kisi, index) => {
            if (kisi.mail === mail) {
                this.tumKisiler.splice(index, 1);
            }
        });
        localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
    }
    //güncellenmisKisi: yeni değerleri içerir
    //mail kişinin veritabanında bulunması için gerekli olan eski maili içerir 
    kisiGuncelle(guncellenmisKisi, mail) {
        if (guncellenmisKisi.mail === mail) {
            this.tumKisiler.forEach((kisi, index) => {
                if (kisi.mail === mail) {
                    this.tumKisiler[index] = guncellenmisKisi;
                    localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
                    return true;
                }
            });
            return true;
        }
        if (this.emailEssizMi(guncellenmisKisi.mail)) {
            console.log(guncellenmisKisi.mail + "için kontrol yapılıyor ve sonuc : güncelleme yapabilirsin");

            this.tumKisiler.forEach((kisi, index) => {
                if (kisi.mail === mail) {
                    this.tumKisiler[index] = guncellenmisKisi;
                    localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
                    return true;
                }
            });
            return true;

        } else {
            console.log(guncellenmisKisi.mail + "mail kullanımda güncelleme yapılamaz ");
            return false;
        }
    }
}
// static şekilde yazdığımızda içerisinde parametre olmasa da olur 
// const cansel = new Kisi('cansel', 'cimen', 'cansel@canselcom');
// const ekran = new Ekran();
document.addEventListener('DOMContentLoaded', function (e) {
    const ekran = new Ekran();
});