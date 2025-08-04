import React from 'react';
import Button from '../../Button/Button';

const CardAddress = ({ address, onEdit, onDelete, onSetDefault }) => {
  return (
    <div className="address-card animate-fade-in">
      <div className="address-header">
        <div className="address-title-section">
          <h3 className="address-name">{address.address_name}</h3>
          {address.is_default && (
            <span className="default-badge animate-slide-in-right">
              Default
            </span>
          )}
        </div>

        <div className="address-actions">
          {!address.is_default && (
            <Button
              variant={['icon', 'danger']}
              size="sm"
              onClick={() => onDelete(address.id)}
              text="Delete"
            />
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(address)}
            text="Edit"
          />
        </div>
      </div>

      <div className="address-content">
        <div className="address-line primary">
          {address.street}, {address.number}
        </div>

        <div className="address-line secondary">
          {address.district} | {address.city} | {address.state}
        </div>
        {address.complement && (
          <div className="address-line secondary">{address.complement}</div>
        )}
      </div>

      {!address.is_default && (
        <div className="address-footer">
          <Button
            variant="outline"
            size="sm"
            text="Set as Default"
            onClick={() => onSetDefault(address.id)}
          />
        </div>
      )}
    </div>
  );
};

export default CardAddress;
