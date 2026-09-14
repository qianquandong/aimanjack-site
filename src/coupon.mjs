export function couponCta(lang) {
  const c = lang === 'zh' ? {
    eyebrow: 'Email 优惠', h: '领取适用于任何服务的 $25 优惠券',
    sub: '留下 email，我们会发一张唯一优惠码。任何 AI Man Jack 服务可用一次。',
    label: 'Email 地址', placeholder: 'you@company.com', button: '发送我的 $25 优惠券', loading: '正在发送…',
    privacy: '每个 email 一张，每张使用一次。无最低消费、无到期日、无新客限制。我们只用这个 email 发优惠券，不会因此把你加入营销邮件。',
    accepted: '邮件服务商已接受发送请求。请检查收件箱和垃圾邮件。',
    invalid: '请输入有效的 email 地址。', duplicate: '这个 email 已经领取过优惠券。',
    failed: '优惠券邮件没有发送成功。请稍后再试，或直接联系 Jack。',
  } : {
    eyebrow: 'Email offer', h: 'Get a $25 coupon for any service',
    sub: 'Enter your email and we will send one unique coupon code. Use it once on any AI Man Jack service.',
    label: 'Email address', placeholder: 'you@company.com', button: 'Send my $25 coupon', loading: 'Sending…',
    privacy: 'One coupon per email and one use per coupon. No minimum spend, expiration or new-customer restriction. We use this email only to send the coupon; this does not subscribe you to marketing.',
    accepted: 'Our email provider accepted the send request. Check your inbox and spam folder.',
    invalid: 'Enter a valid email address.', duplicate: 'A coupon has already been issued to this email.',
    failed: 'The coupon email was not sent. Try again later or contact Jack directly.',
  };
  return `<section class="section coupon-cta" id="coupon"><div class="wrap narrow center">
<p class="eyebrow">${c.eyebrow}</p><h2>${c.h}</h2><p class="lead">${c.sub}</p>
<form id="coupon-form" class="coupon-form" novalidate>
<label for="coupon-email">${c.label}</label><div class="coupon-row"><input id="coupon-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" placeholder="${c.placeholder}" required><button class="btn btn-primary" type="submit">${c.button}</button></div>
<label class="coupon-hp" aria-hidden="true">Website<input name="company_url" tabindex="-1" autocomplete="off"></label>
<p class="coupon-privacy">${c.privacy}</p><p id="coupon-status" class="coupon-status" role="status" aria-live="polite"></p>
</form></div>
<script>(function(){var f=document.getElementById('coupon-form');if(!f)return;var e=document.getElementById('coupon-email'),b=f.querySelector('button'),s=document.getElementById('coupon-status'),C=${JSON.stringify(c)};
f.addEventListener('submit',function(x){x.preventDefault();if(!e.validity.valid){s.textContent=C.invalid;e.focus();return}b.disabled=true;b.textContent=C.loading;s.textContent='';
fetch('/v1/coupons',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:e.value,company_url:f.elements.company_url.value})}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(r.ok){s.textContent=C.accepted;f.reset();return}if(j.error==='email_invalid'){s.textContent=C.invalid;e.focus()}else if(j.error==='already_claimed')s.textContent=C.duplicate;else s.textContent=C.failed})}).catch(function(){s.textContent=C.failed}).finally(function(){b.disabled=false;b.textContent=C.button})});})();</script>`;
}
