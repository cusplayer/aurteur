import React from 'react';

const Contacts = () => {
  return (
    <div className="contactInfo">
      <div className="contactTitle">Contact Us</div>
      <div className="contactDetails">
        <p>Email: example@example.com</p>
        <p>Phone: +1234567890</p>
        {/* Добавьте другие контактные данные по необходимости */}
      </div>
    </div>
  );
};

export default Contacts;
