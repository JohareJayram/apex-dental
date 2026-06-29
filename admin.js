document.addEventListener('DOMContentLoaded', () => {
  renderAppointments();
});

function getAppointments() {
  const data = localStorage.getItem('apex_appointments');
  return data ? JSON.parse(data) : [];
}

function renderAppointments() {
  const tbody = document.getElementById('appointments-body');
  const noData = document.getElementById('no-appointments');
  const table = document.querySelector('.appointments-table');
  
  const appointments = getAppointments();
  
  tbody.innerHTML = ''; // Clear current rows
  
  if (appointments.length === 0) {
    table.style.display = 'none';
    noData.style.display = 'block';
    return;
  }
  
  table.style.display = 'table';
  noData.style.display = 'none';
  
  // Sort by newest first (reverse array)
  appointments.slice().reverse().forEach(apt => {
    const tr = document.createElement('tr');
    
    // Service formatting
    let serviceName = apt.service;
    if(apt.service === 'cosmetic') serviceName = 'Cosmetic Dentistry';
    if(apt.service === 'implants') serviceName = 'Dental Implants';
    if(apt.service === 'preventative') serviceName = 'Preventative Care';
    if(apt.service === 'other') serviceName = 'General Consultation';

    // Status formatting
    const statusClass = apt.status === 'Confirmed' ? 'confirmed' : 'pending';
    
    // Button state
    const btnDisabled = apt.status === 'Confirmed' ? 'disabled' : '';
    const btnText = apt.status === 'Confirmed' ? 'Confirmed ✓' : 'Confirm';

    tr.innerHTML = `
      <td>${apt.date}</td>
      <td><strong>${apt.name}</strong></td>
      <td>${apt.phone}</td>
      <td>${serviceName}</td>
      <td><span class="badge ${statusClass}">${apt.status}</span></td>
      <td>
        <button class="btn-confirm" data-id="${apt.id}" ${btnDisabled}>${btnText}</button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  // Add event listeners to confirm buttons
  document.querySelectorAll('.btn-confirm').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      confirmAppointment(id);
    });
  });
}

function confirmAppointment(id) {
  const appointments = getAppointments();
  const updated = appointments.map(apt => {
    if (apt.id === id) {
      return { ...apt, status: 'Confirmed' };
    }
    return apt;
  });
  
  localStorage.setItem('apex_appointments', JSON.stringify(updated));
  renderAppointments(); // Re-render to reflect changes
}
