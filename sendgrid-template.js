const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendgrid = (email, url) => {
  sgMail.send({
    to: `${email}`,
    from: 'zazmic@zazmic.com',
    template_id: 'd-2c14617782b44092b1ba6e4c91477cf5',
    dynamic_template_data: {
      url: `${url}`,
    },
  });
};
