import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './Equipment.css';

const EquipmentReservationConfirm = () => {
  const { id } = useParams();
  const location = useLocation();
  const { startDate, endDate, insurance, notes, deposit } = location.state || {};

  // Example values, replace with real data as needed
  const equipment = {
    name: 'John Deere 8R Tractor',
    image: '',
    rentalFee: 1750,
    serviceFee: 87.5,
    insurance: insurance === 'premium' ? 45 * 5 : 0, // 5 days example
    deposit: deposit || 1000,
    total: 2837.5,
    duration: 5,
  };

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setProcessing(true);
    setSuccess(false);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <div className="reservation-page">
      <div className="reservation-content payment-step">
        {/* Left: Payment Form */}
        <div className="payment-left">
          <div className="reservation-card payment-form-card">
            <div className="payment-title">Payment Details</div>
            <div className="payment-method-row">
              <button className={`payment-method-btn ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')} disabled={processing || success}>Credit Card</button>
              <button className={`payment-method-btn ${paymentMethod === 'cmi' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cmi')} disabled={processing || success}>CMI Mobile</button>
            </div>
            {paymentMethod === 'card' && (
              <div className="payment-fields">
                <input type="text" placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} disabled={processing || success} />
                <div className="payment-fields-row">
                  <input type="text" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} disabled={processing || success} />
                  <input type="text" placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value)} disabled={processing || success} />
                </div>
                <input type="text" placeholder="Name on Card" value={cardName} onChange={e => setCardName(e.target.value)} disabled={processing || success} />
              </div>
            )}
            {paymentMethod === 'cmi' && (
              <div className="payment-fields">
                <input type="text" placeholder="CMI Mobile Number" disabled={processing || success} />
              </div>
            )}
            <button className="reservation-next-btn" style={{ marginTop: 24 }} onClick={handlePayment} disabled={processing || success}>
              {processing ? (
                <span><span className="spinner" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }}></span>Processing...</span>
              ) : success ? 'Payment Successful!' : 'Complete Payment'}
            </button>
            {success && <div style={{ color: '#2B5727', fontWeight: 600, marginTop: 16, textAlign: 'center', fontSize: 16 }}>Payment Successful!</div>}
          </div>
        </div>
        {/* Right: Order Summary */}
        <div className="payment-right">
          <div className="reservation-card order-summary-card">
            <div className="order-summary-title">Order Summary</div>
            <div className="order-summary-row">
              <img src={equipment.image || '/tractor-placeholder.png'} alt={equipment.name} className="equipment-image-sm" />
              <div>
                <div className="equipment-title">{equipment.name}</div>
                <div>{equipment.duration} days rental</div>
              </div>
            </div>
            <div className="order-summary-info">
              <div className="order-summary-item"><span>Rental Fee</span><span>${equipment.rentalFee.toFixed(2)}</span></div>
              <div className="order-summary-item"><span>Service Fee</span><span>${equipment.serviceFee.toFixed(2)}</span></div>
              <div className="order-summary-item"><span>Insurance ({insurance === 'premium' ? 'Premium' : 'Basic'})</span><span>{insurance === 'premium' ? `$${(45 * equipment.duration).toFixed(2)}` : 'Included'}</span></div>
              <div className="order-summary-item"><span>Security Deposit</span><span>${equipment.deposit.toFixed(2)}</span></div>
            </div>
            <div className="order-summary-total-row"><span>Total to Pay Now</span><span>${equipment.total.toFixed(2)}</span></div>
            <button className="reservation-next-btn" style={{ marginTop: 16 }} disabled>Complete Payment</button>
            <div className="order-summary-note">Your payment is secured by CMI Bank</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentReservationConfirm; 