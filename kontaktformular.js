const kontaktFormular=document.getElementById('prohw-contact-form');

if(kontaktFormular){
  const pruefFelder=[...kontaktFormular.querySelectorAll('input,textarea')];
  const pflichtFelder=[...kontaktFormular.querySelectorAll('[required]')];
  const strassenFeld=kontaktFormular.elements.strasse;
  const strassenHinweis=document.getElementById('strasse-hinweis');
  let hinweisTimer;

  function meldungFuer(feld){
    if(feld.validity.valueMissing)return 'Pflichtangabe: Bitte füllen Sie dieses Feld aus.';
    if(feld.name==='telefon'&&feld.validity.patternMismatch)return 'Bitte geben Sie die Telefonnummer ausschließlich mit Zahlen ein.';
    if(feld.name==='email'&&(feld.validity.typeMismatch||feld.validity.patternMismatch))return 'Bitte geben Sie eine vollständige gültige E-Mail-Adresse ein, z. B. name@firma.de.';
    if(feld.name==='strasse'&&feld.validity.patternMismatch)return 'Bitte geben Sie nur den Straßennamen ein. Zahlen gehören in das Feld Hausnummer.';
    if(feld.name==='postleitzahl'&&feld.validity.patternMismatch)return 'Bitte geben Sie eine gültige fünfstellige Postleitzahl ein.';
    if(feld.name==='ort'&&feld.validity.patternMismatch)return 'Bitte geben Sie im Feld Ort nur Buchstaben und übliche Ortsnamenszeichen ein.';
    return 'Bitte prüfen Sie Ihre Eingabe.';
  }

  function fehlerElement(feld){
    let fehler=feld.parentElement.querySelector('.inline-error');
    if(!fehler){
      fehler=document.createElement('span');
      fehler.className='inline-error';
      fehler.setAttribute('role','alert');
      fehler.setAttribute('aria-live','polite');
      const ziel=feld.type==='checkbox'?feld.parentElement.querySelector('span:not(.inline-error)'):feld;
      ziel.insertAdjacentElement('afterend',fehler);
    }
    return fehler;
  }

  function feldPruefen(feld){
    feld.setCustomValidity('');
    const fehler=fehlerElement(feld);
    if(feld.checkValidity()){
      feld.classList.remove('invalid');
      feld.removeAttribute('aria-invalid');
      fehler.textContent='';
      return true;
    }
    const meldung=meldungFuer(feld);
    feld.setCustomValidity(meldung);
    feld.classList.add('invalid');
    feld.setAttribute('aria-invalid','true');
    fehler.textContent=meldung;
    return false;
  }

  let fokusRueckkehr=false;

  pruefFelder.forEach(feld=>{
    fieldEvents(feld);
  });

  function fieldEvents(feld){
    feld.addEventListener('blur',()=>{
      if(!feldPruefen(feld)&&feld.type!=='checkbox'&&!fokusRueckkehr){
        fokusRueckkehr=true;
        setTimeout(()=>{
          feld.focus();
          if(typeof feld.select==='function')feld.select();
          fokusRueckkehr=false;
        },0);
      }
    });
    feld.addEventListener('input',()=>{
      if(feld.classList.contains('invalid'))feldPruefen(feld);
    });
    feld.addEventListener('change',()=>{
      if(feld.classList.contains('invalid'))feldPruefen(feld);
    });
  }

  function ziffernAusStrasseEntfernen(){
    if(!/[0-9]/.test(strassenFeld.value))return;
    const position=strassenFeld.selectionStart??strassenFeld.value.length;
    const neuePosition=strassenFeld.value.slice(0,position).replace(/[0-9]/g,'').length;
    strassenFeld.value=strassenFeld.value.replace(/[0-9]/g,'');
    strassenFeld.setSelectionRange(neuePosition,neuePosition);
    strassenHinweis.textContent='Zahlen sind im Feld Straße nicht erlaubt und wurden gelöscht. Bitte geben Sie die Zahl im Feld Hausnummer ein.';
    strassenHinweis.classList.add('show');
    clearTimeout(hinweisTimer);
    hinweisTimer=setTimeout(()=>strassenHinweis.classList.remove('show'),8000);
  }

  strassenFeld.addEventListener('input',ziffernAusStrasseEntfernen);
  strassenFeld.addEventListener('paste',()=>setTimeout(ziffernAusStrasseEntfernen,0));

  kontaktFormular.addEventListener('submit',event=>{
    event.preventDefault();
    const erstesUngueltiges=pflichtFelder.find(feld=>!feldPruefen(feld));
    if(erstesUngueltiges){
      erstesUngueltiges.scrollIntoView({behavior:'smooth',block:'center'});
      setTimeout(()=>{
        erstesUngueltiges.focus({preventScroll:true});
        erstesUngueltiges.reportValidity();
      },350);
      return;
    }
    const daten=new FormData(kontaktFormular);
    const inhalt=[
      'Name: '+daten.get('name'),
      'Vorname: '+daten.get('vorname'),
      'Straße: '+daten.get('strasse'),
      'Hausnummer: '+daten.get('hausnummer'),
      'Postleitzahl: '+daten.get('postleitzahl'),
      'Ort: '+daten.get('ort'),
      'Etage: '+daten.get('etage'),
      'Lage: '+(daten.get('lage')||'nicht angegeben'),
      'Telefonnummer: '+daten.get('telefon'),
      'E-Mail-Adresse: '+daten.get('email'),
      '',
      'Anliegen:',
      daten.get('anliegen')
    ].join('\n');
    window.location.href='mailto:info@prohw.de?subject='+encodeURIComponent('Kontaktanfrage über die ProHW-Webseite')+'&body='+encodeURIComponent(inhalt);
  });
}
