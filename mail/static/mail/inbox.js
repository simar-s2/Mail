document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', submit_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function submit_email(event) {
  event.preventDefault()

  // Post email to API route
  fetch('/emails' , {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
    load_mailbox('sent')
  })
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const emailsView = document.getElementById('emails-view');
  const emailsContainer = document.createElement('ul')
  emailsContainer.className = 'list-group list-group-flush';
  emailsView.appendChild(emailsContainer)

  fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            emails.forEach(email => {
                const div = document.createElement('div');
                div.className = 'email row';
                if (email.subject) {
                  div.innerHTML = `
                  <div class="col-3">
                    ${email.sender}
                  </div>  
                  <div class="col-6">
                    ${email.subject}
                  </div>
                  <div class="col-3">
                    ${email.timestamp}
                  </div> 
                `;
                } else {
                  div.innerHTML = `
                  <div class="col-3">
                    ${email.sender}
                  </div>  
                  <div class="col-6">
                    (no subject)
                  </div>
                  <div class="col-3">
                    ${email.timestamp}
                  </div> 
                `;
                }
                emailsView.appendChild(div);
            });
        })
}
