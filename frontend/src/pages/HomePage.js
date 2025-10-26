// import React from 'react';
// import './HomePage.css';

import NavBar from "../components/Navbar";
import '../assets/css/home.css';
import heroprofile from '../assets/img/danz.png';
import splitimg from '../assets/img/homesplitimg.png';
import section2 from '../assets/img/section2.png';
import table1 from '../assets/img/Table 1.png';
import step1 from '../assets/img/step1.png';
import step3 from '../assets/img/step3.png';

export default function HomePage() {
  return (
    <>
      <NavBar />
      <section className="herosection">
        <div className="herosection-left">
          <h1>Protect your music. <br/>
            Document every session Effortlessly
          </h1>
          <p>
            Mangrove is a document-filling app that helps artists,
            producers, and executives instantly generate split sheets and
            session records.
          </p>

          <button className="join-session">Join A Session</button>
          <button className="create-session">Create A Session</button>
        </div>

        <div className="userprofile">
          <div className="card">
            <img src={heroprofile} alt="Profile" className="card-img" />
            <h2 className="card-title">Danz</h2>
            <p className="card-subtitle">50% of Song Owned</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>

        <div className="herosection-right">
          <div className="split-summary">
            <div className="split-wrapper">
              <div className="split-header">
                <span className="status-pill">● Completed</span> 
                <button className="split-cta">SPLIT</button>
              </div>

              <div className="split-items">
                <div className="split-item">
                  <img src={require('../assets/img/danz.png')} alt="Tunde" className="split-avatar" />
                  <div className="split-percent">50%</div>
                  <div className="split-name">Tunde</div>
                </div>
                <div className="split-divider" />
                <div className="split-item">
                  <img src={require('../assets/img/Image above-2.png')} alt="DJ Maya" className="split-avatar" />
                  <div className="split-percent">25%</div>
                  <div className="split-name">DJ Maya</div>
                </div>
                <div className="split-divider" />
                <div className="split-item">
                  <img src={require('../assets/img/Image above-3.png')} alt="Wolf Alien" className="split-avatar" />
                  <div className="split-percent">15%</div>
                  <div className="split-name">Wolf Alien</div>
                </div>
                <div className="split-divider" />
                <div className="split-item">
                  <img src={require('../assets/img/Image above-4.png')} alt="2na" className="split-avatar" />
                  <div className="split-percent">10%</div>
                  <div className="split-name">2na</div>
                </div>
              </div>
            </div>

            <div className="active-sessions">
              <h3>Active sessions</h3>
              <div className="session-grid">
                <div className="session-card">
                  <img src={require('../assets/img/danz.png')} alt="Danz" />
                  <div className="session-title">Danz</div>
                  <div className="session-sub">Tunde</div>
                </div>
                <div className="session-card">
                  <img alt="Y2K" />
                  <div className="session-title">Y2K</div>
                  <div className="session-sub">Tunde</div>
                </div>
                <div className="session-card">
                  {/* <img src={require()} alt="Impromptu" /> */}
                  <div className="session-title">Impromptu</div>
                  <div className="session-sub">Mavin the Man</div>
                </div>
                <div className="session-card">
                  <img src={require('../assets/img/Image above-4.png')} alt="Trappalicious" />
                  <div className="session-title">Trappalicious</div>
                  <div className="session-sub">Dot Lad</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="for-artists">
        <div className="for-artists__inner">
          <div className="for-artists__visual">
            <div className="visual-card">
              <img src={section2} alt="For artists visual" />
            </div>
          </div>
          <div className="for-artists__content">
            <h2>For artists, by artists. The simplest way to protect your music</h2>
            <p className="lead">With a clean, distraction-free interface, Mangrove makes ownership protection effortless, so you can focus on creating.</p>
          </div>
        </div>
      </section>

      <section className="sessions-to-splitsheets">
        <div className="steps-inner">
          <div className="step">
            <div className="step-visual card-gradient">
              <img src={step1} alt="Step 1 visual" />
            </div>
            <div className="step-badge">Step 1</div>
            <h3>Create or join a session</h3>
            <p>Easily start a new session or jump into one by scanning a QR code.</p>
          </div>

          <div className="step">
            <div className="step-visual card-gradient">
              <img src={table1} alt="Split sheet table" />
            </div>
            <div className="step-badge">Step 2</div>
            <h3>Auto-fill your details</h3>
            <p>Your profile data instantly populates the split sheet, saving time and errors.</p>
          </div>

          <div className="step">
            <div className="step-visual card-gradient">
              <img src={step3} alt="Step 3 visual" />
            </div>
            <div className="step-badge">Step 3</div>
            <h3>Generate split sheets</h3>
            <p>Negotiate splits, approve changes, and generate official receipts.</p>
          </div>
        </div>
      </section>


      <section className="pricing-section">
        <div className="pricing-inner">
          <h2 className="pricing-title">Choose the plan that fits your flow</h2>
          <p className="pricing-sub">Start free, upgrade when you need more sessions.</p>

          <div className="plans-grid">
            <div className="plan">
              <div className="plan-badge">For new artists</div>
              <h3 className="plan-name">Free Plan</h3>
              <div className="plan-price"><span className="price-amount">$0</span> / user per month</div>
              <ul className="plan-features">
                <li>5 free sessions per month</li>
                <li>Access to split sheets & receipts</li>
                <li>Invite unlimited collaborators</li>
                <li>Basic support</li>
              </ul>
              <button className="plan-cta primary">START FREE</button>
            </div>

            <div className="plan">
              <div className="plan-badge">For active collaborators</div>
              <h3 className="plan-name">Session Packs</h3>
              <div className="plan-price">from <span className="price-amount">$19.99</span></div>
              <ul className="plan-features">
                <li>Buy bundles of sessions</li>
                <li>No expiration date</li>
                <li>Ideal for multiple projects</li>
                <li>Shareable across collaborators</li>
              </ul>
              <button className="plan-cta outline">BUY A PACK</button>
            </div>

            <div className="plan">
              <div className="plan-badge">For professionals & studios</div>
              <h3 className="plan-name">Premium Plan</h3>
              <div className="plan-price"><span className="price-amount">$29.99</span> / user per month</div>
              <ul className="plan-features">
                <li>Unlimited sessions</li>
                <li>Advanced split negotiation tools</li>
                <li>Priority support</li>
                <li>Early access to new features</li>
              </ul>
              <button className="plan-cta outline">GO PREMIUM</button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="trusted">
        <div className="trusted-inner">
          <h2>Trusted by creators who value their art</h2>
          <p className="trusted-sub mb-5">Hear how Mangrove helps artists, producers, and managers protect what they create.</p>

          <div className="trusted-carousel">
            <div className="trust-card side left">
              <div className="card-body">
                <p className="quote">“Before Mangrove, I’d lose time chasing signatures — now sessions are recorded, signed, and split in minutes.”</p>
                <div className="meta">
                  <div className="meta-name">Tunde Akinsana</div>
                  <div className="meta-role">Producer</div>
                </div>
              </div>
            </div>

            <div className="trust-card center">
              <div className="avatar-wrap">
                <img src={require('../assets/img/danz.png')} alt="DJ Maya" />
              </div>
              <div className="card-body">
                <p className="quote">“No more chasing people for signatures. I send a QR code, they sign in seconds, and we all get receipts instantly.”</p>
                <div className="meta">
                  <div className="meta-name">DJ Maya</div>
                  <div className="meta-role">Producer</div>
                </div>
              </div>
            </div>

            <div className="trust-card side right">
              <div className="card-body">
                <p className="quote">“Mangrove keeps our sessions tidy — everyone signs off and splits are ready to go.”</p>
                <div className="meta">
                  <div className="meta-name">Lela Harper</div>
                  <div className="meta-role">Composer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="protect">
        <div className="protect-header">
          <h2>Everything you need to protect your music</h2>
          <p className="protect-sub">Mangrove takes the hassle out of split sheets so you can focus on creating.</p>
        </div>

        <div className="protect-inner">
          <div className="protect-grid">
            <div className="protect-card small">
              <img src={require('../assets/img/InstantSplitSheet.png')} alt="split card" />
            </div>
            <div className="protect-feature">
              <h4>Instant Split Sheet Creation</h4>
              <p>No more clunky Word templates. Generate professional split sheets in seconds, auto-filled with your profile data.</p>
            </div>

            <div className="protect-card qr">
              <img src={require('../assets/img/verticalcallout.png')} alt="qr card" />
            </div>
            <div className="protect-feature">
              <h4>QR Code Sign-In</h4>
              <p>Invite collaborators instantly. They just scan and join the session — no login chaos, no lost contacts.</p>
            </div>

            <div className="protect-card log">
              <img src={require('../assets/img/negotiations.png')} alt="log card" />
            </div>
            <div className="protect-feature">
              <h4>Real-Time Negotiation & Approvals</h4>
              <p>Finalize ownership splits on the spot. Everyone sees changes live, reducing disputes later.</p>
            </div>

            <div className="protect-card jam">
              <img src={require('../assets/img/jams.png')} alt="jam card" />
            </div>
            <div className="protect-feature">
              <h4>Mangrove Jams</h4>
              <p>Relive your best sessions. Highlights showcase your top collaborators, songs, and moments.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="built-for">
        <h2>Built for every role in the studio</h2>
        <div className="built-for-inner">
          <div className="built-card">
            {/* <div className="built-image-placeholder" aria-hidden="true"></div> */}
            <img className="built-image-placeholder" src={require('../assets/img/artists.png')} alt="split card" />
            <h3 className="built-role">Artists</h3>

            <div className="ps-row">
              <div className="ps-icon ps-icon--bad">✖</div>
              <div className="ps-copy">
                <div className="ps-label">Problem</div>
                <div className="ps-text">Fear of losing credit or ownership in fast-moving sessions.</div>
              </div>
            </div>

            <div className="ps-row">
              <div className="ps-icon ps-icon--good">✔</div>
              <div className="ps-copy">
                <div className="ps-label">Solution</div>
                <div className="ps-text">Mangrove auto-fills split sheets and gives you receipts of every change, so your rights are documented.</div>
              </div>
            </div>
          </div>

          <div className="built-card">
            {/* <div className="built-image-placeholder" aria-hidden="true"></div> */}
            <img className="built-image-placeholder" src={require('../assets/img/producers.png')} alt="split card" />
            <h3 className="built-role">Producers</h3>

            <div className="ps-row">
              <div className="ps-icon ps-icon--bad">✖</div>
              <div className="ps-copy">
                <div className="ps-label">Problem</div>
                <div className="ps-text">Juggling multiple sessions makes tracking contributions messy.</div>
              </div>
            </div>

            <div className="ps-row">
              <div className="ps-icon ps-icon--good">✔</div>
              <div className="ps-copy">
                <div className="ps-label">Solution</div>
                <div className="ps-text">Log each session with QR code sign-in, track who did what, and keep everything stored securely.</div>
              </div>
            </div>
          </div>

          <div className="built-card">
            <img className="built-image-placeholder" src={require('../assets/img/executives.png')} alt="split card" />
            <h3 className="built-role">Executives</h3>

            <div className="ps-row">
              <div className="ps-icon ps-icon--bad">✖</div>
              <div className="ps-copy">
                <div className="ps-label">Problem</div>
                <div className="ps-text">Negotiations and paperwork slow down projects and cause disputes.</div>
              </div>
            </div>

            <div className="ps-row">
              <div className="ps-icon ps-icon--good">✔</div>
              <div className="ps-copy">
                <div className="ps-label">Solution</div>
                <div className="ps-text">Instantly approve or negotiate splits in-app, generate professional receipts, and save hours of work.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta-inner">
          <h2>Start your first free session today</h2>

          <div className="cta-buttons">
            <button className="cta-join">JOIN A SESSION</button>
            <button className="cta-create">CREATE A SESSION</button>
          </div>

          <ul className="cta-features">
            <li><span className="check">✔</span> 5 free sessions every month</li>
            <li><span className="check">✔</span> No hidden fees</li>
            <li><span className="check">✔</span> Cancel anytime</li>
          </ul>
        </div>
      </section>

    </>
  );
}
