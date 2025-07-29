<div className="addresses-list">
  {addresses.map((address) => (
    <div key={address.id} className="address-card">
      <div className="address-header">
        <div className="address-type">
          {address.isDefault && <span className="default-badge">Default</span>}
        </div>
        <div className="address-actions">
          <button className="btn-icon" onClick={() => handleEditClick()}>
            Edit
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={() => handleDeleteAddress(address.id)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="address-content">
        <div className="address-name">Vini</div>
        <div className="address-details">
          <div>{address.address}</div>
          {address.apartment && <div>{address.apartment}</div>}
          <div>
            {address.city}, {address.state} {address.zipCode}
          </div>
          <div>{address.country}</div>
          <div>{address.phone}</div>
        </div>
      </div>

      {!address.isDefault && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleSetDefault(address.id)}
        >
          Set as Default
        </button>
      )}
    </div>
  ))}
</div>;
