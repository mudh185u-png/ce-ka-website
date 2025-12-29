import React from 'react';
import { useTranslation } from 'react-i18next';
import LegalLayout from '../components/LegalLayout';

const RefundPolicy: React.FC = () => {
    const { t } = useTranslation();

    return (
        <LegalLayout title={t('policies.refund.title')}>
            <p>{t('policies.refund.desc')}</p>
            <section style={{ marginTop: '2rem' }}>
                <h3>1. İade Koşulları</h3>
                <p>Ürünlerin iade edilebilmesi için hasar görmemiş ve orijinal ambalajında olması gerekmektedir.</p>
            </section>
            <section style={{ marginTop: '2rem' }}>
                <h3>2. Süreç</h3>
                <p>İade talebinizi info@ceka.com.tr adresine ileterek süreci başlatabilirsiniz. Onaylanan iadeler 7 iş günü içinde hesabınıza aktarılır.</p>
            </section>
        </LegalLayout>
    );
};

export default RefundPolicy;
