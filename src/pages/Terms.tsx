import React from 'react';
import { useTranslation } from 'react-i18next';
import LegalLayout from '../components/LegalLayout';

const Terms: React.FC = () => {
    const { t } = useTranslation();

    return (
        <LegalLayout title={t('policies.terms.title')}>
            <p>{t('policies.terms.desc')}</p>
            <section style={{ marginTop: '2rem' }}>
                <h3>1. Hizmet Koşulları</h3>
                <p>Müşterilerimiz, web sitemizi kullanarak yasal yaş sınırında olduklarını ve verdikleri bilgilerin doğruluğunu taahhüt ederler.</p>
            </section>
            <section style={{ marginTop: '2rem' }}>
                <h3>2. Fikri Mülkiyet</h3>
                <p>Bu sitedeki tüm içerikler Ce & Ka markasına aittir ve izinsiz kopyalanamaz.</p>
            </section>
        </LegalLayout>
    );
};

export default Terms;
