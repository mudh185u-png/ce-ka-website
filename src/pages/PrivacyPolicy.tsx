import React from 'react';
import { useTranslation } from 'react-i18next';
import LegalLayout from '../components/LegalLayout';

const PrivacyPolicy: React.FC = () => {
    const { t } = useTranslation();

    return (
        <LegalLayout title={t('policies.privacy.title')}>
            <p>{t('policies.privacy.desc')}</p>
            <section style={{ marginTop: '2rem' }}>
                <h3>1. Veri Toplama</h3>
                <p>Web sitemizi ziyaret ettiğinizde veya sipariş verdiğinizde adınız, e-posta adresiniz ve iletişim bilgileriniz gibi verileri topluyoruz.</p>
            </section>
            <section style={{ marginTop: '2rem' }}>
                <h3>2. Veri Kullanımı</h3>
                <p>Topladığımız veriler siparişlerinizi yönetmek, sizinle iletişim kurmak ve hizmetlerimizi geliştirmek için kullanılır.</p>
            </section>
        </LegalLayout>
    );
};

export default PrivacyPolicy;
