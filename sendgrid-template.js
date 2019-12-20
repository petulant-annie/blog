const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.verification = (email, url) => {
  sgMail.send({
    to: `${email}`,
    from: 'zazmic@zazmic.com',
    template_id: 'd-2c14617782b44092b1ba6e4c91477cf5',
    dynamic_template_data: {
      url: `${url}`,
    },
  });
};

exports.pro = (email) => {
  sgMail.send({
    to: `${email}`,
    from: 'zazmic@zazmic.com',
    template_id: 'd-088109fd923c47d28a388a8a0badf589',
  });
};

exports.payments = (email, invoice) => {
  sgMail.send({
    to: `${email}`,
    from: 'zazmic@zazmic.com',
    template_id: 'd-74a75e4147a7487783f881f59f18d1b2',
    dynamic_template_data: {
      invoice: `${invoice}`,
    },
  });
};