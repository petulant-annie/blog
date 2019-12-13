const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

sgMail.send({
  to: 'oleksii.n@zazmic.com',
  from: 'zazmic@zazmic.com',
  template_id: 'd-2c14617782b44092b1ba6e4c91477cf5',
  dynamic_template_data: {
    url: 'Zazmic Node.js Mentorship',
  },
});