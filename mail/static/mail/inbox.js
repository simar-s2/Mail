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

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
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
  document.querySelector('#view-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const emailsView = document.getElementById('emails-view');

  // Fetch emails and populate mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const div = document.createElement('div');
      if (email.read === true) {
        div.className = 'email email-unread row'
      } else {
        div.className = 'email email-read row';
      }
        div.addEventListener('click', () => view_email(email.id))
        div.innerHTML = `
        <div class="email-sender col-3 text-truncate">
          ${email.sender}
        </div>  
        <div class="email-subject col-6 text-truncate">
          ${email.subject ? email.subject :'(no subject)'}
          -
          ${email.body ? email.body : ''}
        </div>
        <div class="email-timestamp col-3">
          ${email.timestamp}
        </div> 
      `;
      emailsView.appendChild(div);
    });
  })
}

function submit_email(event) {
  event.preventDefault()

  // Post email to API route
  fetch('/emails' , {
    method: 'POST',
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

function view_email(email_id) {
  // Fetch email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Render email details
    const viewEmail = document.querySelector('#view-email');
    viewEmail.innerHTML = `
      <h3 class="my-3">${email.subject ? email.subject: 'No Subject'}</h3>
      <p><strong>From:</strong> ${email.sender}</p>
      <p><strong>To:</strong> ${email.recipients.join(', ')}</p>
      <p><strong>Time: </strong> ${email.timestamp}</p>
      <p>${email.body}</p>
    `;

    // Read email if not already been read
    if (!email.read) {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true,
        })
      })
    }

    // Check if the sender of the email is the current user and dont add archive button on emails sent by current user
    if (email.sender !== document.querySelector('#current_user_email').value){
      // Archive Unarchive button
      const archiveButton = document.createElement('button');
      archiveButton.innerHTML = email.archived ? "Unarchive" : "Archive";
      archiveButton.className = "btn btn-primary mr-3"
      archiveButton.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(() => {load_mailbox('inbox')})
      });
      document.querySelector('#view-email').append(archiveButton);
    };

    // Reply to an email button
    const replyButton = document.createElement('button');
    replyButton.innerHTML = 'Reply'
    replyButton.className = "btn btn-primary"
    replyButton.addEventListener('click', function() {

      // Call compose email function
      compose_email()

      // Fill in all the fields with email values
      document.querySelector('#compose-recipients').value = email.sender;
      // Check if subject line has 'RE' case insensitively
      let subject = email.subject;
      if (subject.toLowerCase().startsWith('re') === false) {
        subject = "Re: " + subject;
      }
      document.querySelector('#compose-subject').value = `${subject}`;
      document.querySelector('#compose-body').value = `\n\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;
    });
    document.querySelector('#view-email').append(replyButton);

    // Show the email and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#view-email').style.display = 'block';
  });
}
