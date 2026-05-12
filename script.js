// Small UI behaviors: mobile menu toggle + placeholder hooks
document.addEventListener('DOMContentLoaded', function(){
  const menuToggle = document.getElementById('menuToggle');
  const siteNav = document.getElementById('siteNav');
  if(menuToggle && siteNav){
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('nav-open');
      menuToggle.innerHTML = expanded ? '&#9776;' : '&#10005;';
    });

    // Close mobile nav when a link is clicked
    siteNav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        siteNav.classList.remove('nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '&#9776;';
      });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e){
      if(!siteNav.contains(e.target) && !menuToggle.contains(e.target) && siteNav.classList.contains('nav-open')){
        siteNav.classList.remove('nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '&#9776;';
      }
    });
  }

  // MailerLite subscribe integration
  var subscribeForm = document.getElementById('subscribeForm');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var emailInput = document.getElementById('subscribeEmail');
      var email = emailInput ? emailInput.value.trim() : '';
      if (!email) return;

      var btn = subscribeForm.querySelector('button[type="submit"]');
      var existingErr = subscribeForm.querySelector('.subscribe-error');
      if (existingErr) existingErr.remove();

      btn.disabled = true;
      btn.textContent = 'Subscribing...';

      var API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMWE0YmU2NGRlZWEwZThlMDliZDExYTJmNmFkYmY1OThmYmMzOGQyMGQxMDI3ZDRkNDUzMWIyMTE3Mjk0Mzg5NzgyOTlkOWRkMDU1NGZjNjgiLCJpYXQiOjE3NzI2NTE1NzYuNDA1MDAyLCJuYmYiOjE3NzI2NTE1NzYuNDA1MDA1LCJleHAiOjQ5MjgzMjUxNzYuMzk5MTIyLCJzdWIiOiIyMTgwOTAxIiwic2NvcGVzIjpbXX0.FDbgynvy-KfLz909QUL0WhgAGH-HqdgEVlOv_DHxn-84EFwdCr3nb1S6YqiiVPWJ4qzJWBHzbKgwEKpbm9BIZe6Y9jfpYh_N8L1HpyLW0BTkOl_PnhxukYGa30zxaubLUPmBjro4-hL200lb-yB9TjL0KEXWIAGc1ORw1jTR9yakjsRrOP06rqKhBghUPqHO2IMKl7JSaVnVMN_KO7bQMXvxRk9VQxVoAFF9xpCucn00fQ-H1ItjRzDFG8ufBp9OrFcQuklw8d_2hba2HSKs9vMK58n1jYKf_N1DGtK-sNKS4Q-XYzrWlfsF1_Ki4NmUOQ7i4lNFb39ByFP1csxQZrk71r2_pF-DjatoLMZtYvsmVyCHUVePERsWmoGYIv8wXNBzrRTHdU74TcSxH0NLMYoZxCVHMR5Zj_lX4hyc2S22AcdN7WOisGWPPJq_xG7eHTzoZjrpy65yRGskqsMSZLY2UPcIgJ5tk0EgKNGFbtkPhf4X5O1x7Ml3WDfDuCcGuUc6Qjtywoyn8AzBcaq7qdqrD2ON0rJ2rN828PVnwT2u7HtDaukZl7hNjSx7214wrJx28rQYX1e2mIVCwkApnHpG9o47GpL7DYftoXA_tNvNdTzEE82BWsXjiHU5ZQZuaPuRZAYD8tkt4YdG8A6Xe06QSOxdQEWzJ2DBtstZmlo';
      var GROUP_IDS = ['181037688662525246', '181036989142795513'];

      Promise.all(GROUP_IDS.map(function (groupId) {
        return fetch('https://api.mailerlite.com/api/v2/groups/' + groupId + '/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-MailerLite-ApiKey': API_KEY
          },
          body: JSON.stringify({ email: email })
        }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        });
      }))
        .then(function () {
          var msg = document.createElement('p');
          msg.style.cssText = 'color:#2e7d32;font-size:14px;font-weight:600;margin:8px 0 0;';
          msg.textContent = "You\u2019re subscribed. Check your inbox for a welcome email.";
          subscribeForm.parentNode.insertBefore(msg, subscribeForm);
          subscribeForm.style.display = 'none';
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Subscribe';
          var err = document.createElement('p');
          err.className = 'subscribe-error';
          err.style.cssText = 'color:#c1121f;font-size:13px;font-weight:600;margin:6px 0 0;';
          err.textContent = 'Something went wrong. Please try again.';
          subscribeForm.appendChild(err);
        });
    });
  }
});