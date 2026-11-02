// Baugher-style items, modeled on the past-exam flashcard set Duc shared on 2026-11-01:
// mostly true/false with one detail swapped, plus EXCEPT / "All of the above" / short-scenario multiple choice.
// Loaded after exam3.js. Adds items to existing concepts and adds Mock C.
// TB marks content that comes from the textbook rather than the slides.
(function () {
  var TB = " (Textbook, not on the slides.)";
  function T(stmt, isTrue, explain) {
    return { q: stmt, options: ["True", "False"], answer: isTrue ? 0 : 1, explain: (isTrue ? "True. " : "False. ") + explain };
  }
  function C(q, options, answer, explain) { return { q: q, options: options, answer: answer, explain: explain }; }

  var ADD = {
    ch29: {
      c1: [
        T("A term employee can be legally terminated for cause during the term.", true, "The wrongful discharge risk is for firing a term employee early without cause."),
        T("An at-will employee can be fired only for cause.", false, "At will means with or without cause, subject to the three exceptions.")
      ],
      c2: [
        T("An at-will employee may lawfully be fired for filing a workers' compensation claim.", false, "Exercising a statutory right is a public policy exception."),
        C("Each of the following is protected under the public policy exception EXCEPT:", ["Refusing the employer's request to commit perjury", "Reporting the employer's fraudulent accounting", "Serving on a jury", "Refusing to work overtime the employer lawfully requires"], 3, "Slide 6's four categories: refusing an illegal act, reporting a violation, acting in the public interest, exercising a statutory right. Refusing lawful overtime is none of them.")
      ],
      c3: [
        T("The Family and Medical Leave Act applies to employers with 100 or more workers.", false, "50 or more workers (plus government employers)."),
        T("To be eligible for FMLA leave, an employee must have worked for the employer at least one year and more than 1,250 hours in the previous 12 months.", true, "The 1,250-hour requirement is in the textbook; the slide gives the one-year rule." + TB),
        T("A restored employee is entitled to accrue seniority during the FMLA leave period.", false, "Seniority doesn't accrue during the leave, but the employee keeps what was earned before it." + TB),
        T("A covered employer may deny job restoration after FMLA leave to certain employees under certain conditions.", true, "This is the key-employee exception for highly paid employees." + TB)
      ],
      c4: [
        T("Workers' compensation is an exclusive remedy against the employer, with no exceptions.", false, "Intentional injury by the employer is the exception."),
        T("Compensable workers' compensation injuries do not include employment-related stress or mental illness.", false, "Slide 17 covers physical injuries, employment-related mental illness, and stress."),
        T("Workers' compensation provides state benefits, not federal benefits.", true, "States require employers to insure or self-insure."),
        T("The Occupational Safety and Health Administration's only duty is to inspect places of employment.", false, "It also sets standards, requires record keeping and notices, and enforces the Act."),
        T("OSHA standards include both specific duty standards and a general duty standard.", true, "The general duty is to keep the workplace free of recognized serious hazards." + TB)
      ],
      c5: [
        T("An employer may give an employee who qualifies for overtime the title \"manager\" to avoid paying overtime.", false, "Exempt status depends on the actual job duties and pay, not the title." + TB),
        T("There are no exemptions from the minimum wage and overtime requirements.", false, "Executives, administrative employees, learned professionals, teachers, and others are exempt."),
        T("Under the FLSA, children under 16 cannot work in any job except newspaper delivery.", false, "14- and 15-year-olds can do non-hazardous jobs with limited hours. Only under-14s are limited to newspaper delivery."),
        T("Persons 18 and older may work in any job, whether hazardous or not.", true, "Slide 16."),
        T("An employer cannot require a non-exempt employee to work more than 40 hours a week unless the employee is paid overtime.", true, "1.5 times the regular rate for hours over 40.")
      ],
      c6: [
        T("COBRA lets an employee continue group health insurance after a voluntary termination, but not after an involuntary one.", false, "COBRA covers both voluntary and involuntary termination (except for gross misconduct)." + TB),
        T("Under the Federal Unemployment Tax Act, employers, but not employees, pay unemployment taxes.", true, "Slide 22: employers pay through unemployment taxes."),
        T("The WARN Act requires employers with 50 or more employees to give 15 days' notice before certain plant closings or layoffs.", false, "100 or more employees, and 60 days' notice."),
        T("If employees are represented by a union, WARN notice must still be given to each employee individually.", false, "Notice goes to the union as their representative." + TB)
      ],
      c7: [
        T("An employer may form and control its own company union.", false, "Dominating or forming a company union is an employer unfair labor practice." + TB),
        C("Which statute is known as the union members' \"bill of rights\"?", ["Norris-LaGuardia Act", "National Labor Relations Act (Wagner Act)", "Labor Management Reporting and Disclosure Act (Landrum-Griffin Act)", "Fair Labor Standards Act"], 2, "Landrum-Griffin guarantees members the right to nominate, vote, and take part in meetings.")
      ],
      c8: [
        T("At least 51% of the employees in a bargaining unit must sign authorization cards before a union election is held.", false, "It's 30%. 51% is what wins the election."),
        T("A union needs a two-thirds vote to be certified after a contested election.", false, "A simple majority (51%).")
      ],
      c9: [
        T("A statement by an employer that \"I will close this plant if a union comes in here\" is an unfair labor practice.", true, "Slide 32."),
        C("A union may discipline its members for all of the following EXCEPT:", ["Walking off the job in a non-sanctioned strike", "Working for wages below union scale", "Spying for the employer", "Criticizing union officials"], 3, "Refusing to process grievances or punishing members for criticizing officials is a union ULP (slide 34). The other three are permitted under Landrum-Griffin (slide 44).")
      ],
      c10: [
        C("Which of the following would be illegal strikes?", ["Violent strikes", "Partial or intermittent strikes", "Sit-down strikes", "Wildcat strikes", "All of the above"], 4, "All four are illegal or unprotected (slides 36 and 39)."),
        T("Before there can be a strike, 60% of the union's members must vote in favor.", false, "Just a majority." + TB),
        T("A union must give the employer ten days' notice before it strikes.", false, "The cooling-off period is 60 days (90 for healthcare)."),
        T("Once a strike begins, the employer may continue operations with management personnel but may not hire replacement workers.", false, "The employer can hire replacement workers (slide 37)."),
        T("An employer may dismiss union members who strike in violation of a no-strike clause.", true, "That strike isn't protected."),
        T("Individual members of a union are legally required to honor a strike.", false, "They aren't, though the union may discipline members (and can't fine those who validly resign)." + TB),
        T("An employer may seek an injunction against unlawful picketing.", true, "Picketing that blocks entry, blocks deliveries, or turns violent is unlawful." + TB)
      ],
      c11: [
        T("The Taft-Hartley Act prohibits the closed shop but permits the union shop, unless a state right-to-work law prohibits it.", true, "Taft-Hartley (the Labor-Management Relations Act) is the source of the closed shop ban." + TB),
        T("In a right-to-work state, an agency shop clause is enforceable.", false, "Right-to-work laws outlaw both union shops and agency shops.")
      ]
    },
    ch30: {
      c1: [
        T("The EEOC is the federal agency responsible for enforcing most federal anti-discrimination laws, and its members are appointed by the President.", true, "Slide 10."),
        T("If a state has its own fair employment practices agency, the complainant may file the claim with that agency instead of the EEOC.", true, "Florida has one (the Florida Commission on Human Relations)." + TB),
        T("If the EEOC sues the employer, the complainant may still file a separate lawsuit of his or her own.", false, "Once the EEOC sues, the complainant can't bring a separate suit." + TB),
        C("The EEOC has jurisdiction to investigate charges of discrimination based on which of the following?", ["Race, color, and national origin", "Sex and religion", "Age, disability, and genetic information", "All of the above"], 3, "It enforces Title VII, the ADEA, the ADA, the Equal Pay Act, and GINA.")
      ],
      c2: [
        T("Title VII applies to employers with 50 or more employees.", false, "15 or more."),
        T("Title VII does not apply to labor unions.", false, "It applies to unions with 15 or more members."),
        T("Title VII does not apply to state and local government agencies.", false, "It applies to federal, state, and local governments and agencies."),
        T("Liability for Title VII discrimination falls on the employer, not on individual employees.", true, "Individual coworkers and supervisors aren't personally liable under Title VII." + TB),
        T("An affirmative action plan that sets hiring quotas for minority applicants does not constitute reverse discrimination.", false, "Quotas aren't allowed. Without a remedial justification, preferences are reverse discrimination."),
        C("A company hires only women as sales representatives because it believes customers relate better to women. This violates:", ["The Age Discrimination in Employment Act", "The Equal Pay Act", "Nothing, because sex is a BFOQ here", "Title VII of the Civil Rights Act of 1964"], 3, "Customer preference isn't a BFOQ, so it's sex discrimination under Title VII.")
      ],
      c3: [
        T("A hiring policy that is neutral on its face can still violate Title VII if it disproportionately excludes a protected group.", true, "That's disparate impact."),
        T("To win a disparate impact claim, the plaintiff must prove the employer intended to discriminate.", false, "Impact needs no intent. Intent is the treatment theory.")
      ],
      c4: [
        T("Sexual harassment can occur only between a male supervisor and a female employee.", false, "The victim and harasser can be any sex, including the same sex, and coworkers can harass too."),
        T("An employer is strictly liable when a supervisor's harassment results in a tangible employment action.", true, "No defense is available.")
      ],
      c5: [
        T("Northern Airlines wants to hire only male cabin attendants to serve the growing number of female executives who fly. Sex is a legal BFOQ under these facts.", false, "Customer preference doesn't make sex a BFOQ. The job doesn't require being male."),
        T("Race can be a bona fide occupational qualification if customers prefer it.", false, "A BFOQ can never be based on race or color."),
        C("Each of the following is a defense to a Title VII action EXCEPT:", ["Merit", "A bona fide seniority system", "A bona fide occupational qualification", "Customer preference"], 3, "Slide 30's defenses: merit, seniority, BFOQ, and job-related business necessity.")
      ],
      c6: [
        T("The ADEA protects employees age 50 and older.", false, "Age 40 and older, at employers with 20 or more employees."),
        T("The ADA requires an employer to accommodate a disability even when doing so causes undue hardship.", false, "The duty stops at undue hardship."),
        C("Which law lets a race discrimination plaintiff skip the EEOC process and has no cap on damages?", ["Section 1981 of the Civil Rights Act of 1866", "Title VII", "The ADA", "The ADEA"], 0, "Slide 33.")
      ]
    },
    ch7: {
      c1: [
        T("A misdemeanor is a crime punishable by imprisonment of one year or more.", false, "That's a felony. A misdemeanor is less than one year."),
        T("The Federal Sentencing Guidelines are the detailed rules judges must follow when sentencing defendants in federal court.", true, "Slide 3.")
      ],
      c3: [
        T("An indictment is issued by a magistrate.", false, "An indictment comes from a grand jury. A magistrate issues an information."),
        T("A grand jury decides whether the defendant is guilty.", false, "The grand jury decides whether to charge. The petit jury decides guilt.")
      ],
      c4: [
        C("Which of the following is the lowest standard of proof?", ["Beyond a reasonable doubt", "Clear and convincing", "Preponderance of the evidence", "Probable cause", "Reasonable suspicion"], 4, "Reasonable suspicion (stop and frisk) is the bottom of the ladder."),
        T("Probable cause is a higher standard of proof than preponderance of the evidence.", false, "Preponderance is higher on the slide ladder.")
      ],
      c5: [
        C("Which of the following are exceptions to the search warrant requirement?", ["Plain view", "Consent", "Hot pursuit", "Search incident to a lawful arrest", "All of the above"], 4, "All four are on slide 19."),
        T("Police always need a warrant to search the premises of a business in a highly regulated industry.", false, "Hazardous and highly regulated industries can be searched without a warrant if the statute's procedures are met.")
      ],
      c6: [
        T("The 8th Amendment prohibits capital punishment.", false, "It bars cruel and unusual punishment but not the death penalty."),
        T("An accountant-client privilege exists under federal law.", false, "None federally, so an accountant can be called to testify.")
      ],
      c7: [
        T("A criminal conspiracy conviction requires that the planned crime actually be committed.", false, "An agreement plus an overt act is enough."),
        T("Under the FCPA, small \"grease\" payments to minor officials for routine, ministerial acts are permitted.", true, "Payments that buy a discretionary decision are bribes.")
      ],
      c8: [
        T("Business Email Compromise is when a scammer uses email to trick someone into sending money or revealing confidential company information.", true, "Slide 35.")
      ]
    },
    ch27: {
      c1: [
        T("Under SOX, auditors report to the client's senior management rather than to the audit committee.", false, "The audit committee of the board, not management."),
        T("Under SOX, the lead audit partner must rotate off the client after 7 years.", false, "The lead partner rotates after 5 years. 7 years is for the other partners.")
      ],
      c2: [
        T("GAAS are the rules for preparing financial statements.", false, "GAAP is for preparing statements. GAAS is for conducting audits."),
        C("Which of the following is NOT a type of audit opinion?", ["Unqualified", "Qualified", "Adverse", "Disclaimer", "Conditional"], 4, "The four opinions are unqualified, qualified, adverse, and disclaimer.")
      ],
      c4: [
        T("Under the Ultramares doctrine, an accountant who is merely negligent is liable to any foreseeable user of the financial statements.", false, "That's the Foreseeability doctrine. Ultramares limits it to known parties."),
        T("Under the Restatement view, a negligent accountant is liable to anyone in the same class as a party it knew would rely on the statements.", true, "Slide 17.")
      ],
      c5: [
        T("Under §10(b) of the 1934 Act, an auditor can be liable for mere negligence.", false, "§10(b) requires scienter.")
      ],
      c6: [
        T("Joint and several liability means each accountant is liable only for his or her own share of the damages.", false, "Any one of them can be sued for the full amount.")
      ]
    },
    ch36: {
      c1: [
        T("Chapter 11 of the Bankruptcy Code is liquidation.", false, "Chapter 7 is liquidation. Chapter 11 is reorganization."),
        T("Chapter 13 is available to both individuals and corporations.", false, "Individuals only."),
        C("Which chapters of the Bankruptcy Code have rehabilitation as their objective?", ["Chapters 7 and 11", "Chapters 11 and 13", "Chapters 7 and 13", "Chapter 7 only"], 1, "Slide 2.")
      ],
      c2: [
        T("Creditors can file an involuntary petition to force a debtor into Chapter 13.", false, "Involuntary petitions are only allowed under Chapter 7 or 11."),
        T("The automatic stay takes effect only after creditors receive notice of the filing.", false, "It takes effect the moment the petition is filed.")
      ],
      c3: [
        C("Which of the following allowed claims will be paid first from the debtor's estate in a Chapter 7 bankruptcy?", ["A gap creditor with a claim of $2,000", "A state claiming $5,000 in back taxes", "The trustee's expenses of $3,000", "Employees claiming $4,000 in unpaid wages earned within 90 days of filing"], 2, "Among priority claims, administrative expenses (the trustee's costs) come first, ahead of gap creditors, wages, and taxes." + TB)
      ],
      c4: [
        T("The trustee can recover preferential payments made to non-insiders up to one year before filing.", false, "90 days for non-insiders. One year is for insiders.")
      ],
      c5: [
        C("Which of the following debts are NOT discharged in bankruptcy?", ["Income taxes", "Money obtained fraudulently", "Debts omitted from the debtor's schedules", "All of the above"], 3, "Slide 20."),
        T("Student loans can never be discharged in bankruptcy.", false, "They can be, with undue hardship under the Brunner test.")
      ],
      c6: [
        T("In a Chapter 11 case, creditors cannot vote on the plan of reorganization.", false, "In Chapter 11 creditors vote. In Chapter 13 they don't."),
        T("In Chapter 13, the court, not the creditors, approves the repayment plan.", true, "Slide 26.")
      ]
    },
    ch40: {
      c1: [
        T("Violating an environmental law can result only in civil fines.", false, "Civil and criminal penalties, including imprisonment, plus reputational damage."),
        C("What could happen if a company violates an environmental law?", ["Civil penalties", "Criminal penalties, including imprisonment", "Reputational damage", "All of the above"], 3, "Slides 5 and 36.")
      ],
      c2: [
        T("Under the Clean Air Act, states may not set air pollution standards stricter than federal rules.", false, "Stricter state standards are allowed. Only vehicle standards are limited, with California as the exception."),
        T("Every state may set its own vehicle emission standards.", false, "Only California.")
      ],
      c3: [
        C("Under the Oil Pollution Act, a business that discharges oil into navigable waters may be liable for which of the following?", ["Cleanup costs", "Damage to natural resources", "Restitution for economic losses", "All of the above"], 3, "Slide 15."),
        T("The Clean Water Act set a goal of making all navigable waters suitable for swimming and fishing.", true, "By 1983, and eliminating discharges by 1985.")
      ],
      c4: [
        T("Under CERCLA, a current owner who did not dump the hazardous waste is not liable for the cleanup.", false, "Current owners are potentially responsible parties, and liability is strict."),
        C("Under CERCLA, which of the following are potentially responsible parties?", ["The generator of the waste", "The transporter of the waste", "The current owner or operator of the site", "All of the above"], 3, "Slide 20 lists four, including the owner at the time of disposal.")
      ],
      c5: [
        T("NEPA requires every federal agency to prepare an Environmental Impact Statement for every major federal action significantly affecting the human environment.", true, "Slide 24.")
      ]
    }
  };

  var ex = window.EXAMS.filter(function (e) { return e.id === "exam3"; })[0];
  ex.chapters.forEach(function (ch) {
    var add = ADD[ch.id] || {};
    (ch.concepts || []).forEach(function (c) { if (add[c.id]) c.checks = c.checks.concat(add[c.id]); });
  });

  function MC(ch, q) { q.ch = ch; return q; }
  ex.mocks.push({ id: "C", title: "Mock C (Baugher style: mostly true/false)", minutes: 60, questions: [
    MC("ch29", T("The FMLA guarantees paid leave for the birth of a child.", false, "FMLA leave is unpaid.")),
    MC("ch29", T("The FMLA applies to private employers with 50 or more workers.", true, "Plus federal, state, and local government employers.")),
    MC("ch29", T("Workers' compensation is an exclusive remedy against the employer, except when the employer intentionally injures the employee.", true, "Slide 18.")),
    MC("ch29", T("Exempt employees must be paid overtime for hours worked over 40 in a week.", false, "Exempt employees get neither minimum wage nor overtime.")),
    MC("ch29", T("Authorization cards from 30% of the employees are needed before a union files an election petition.", true, "51% is what wins the election.")),
    MC("ch29", T("A closed shop is legal in states that have no right-to-work law.", false, "The closed shop is illegal everywhere.")),
    MC("ch29", T("Florida is a right-to-work state.", true, "On slide 42's list.")),
    MC("ch29", T("The WARN Act requires employers with 100 or more employees to give 60 days' notice before certain plant closings or layoffs.", true, "Slide 46.")),
    MC("ch29", C("A union may discipline its members for which of the following?", ["Walking off the job in a non-sanctioned strike", "Working for wages below union scale", "Spying for the employer", "All of the above"], 3, "Slide 44.")),
    MC("ch29", C("The Norris-LaGuardia Act:", ["Limits federal courts' power to issue injunctions in non-violent labor disputes", "Created the NLRB's union election process", "Requires 60 days' notice before a strike", "Guarantees union members the right to vote in union elections"], 0, "The election process comes from the NLRA, and voting rights come from Landrum-Griffin.")),
    MC("ch29", C("Which of the following is NOT protected activity?", ["A wildcat strike", "An economic strike after proper notice", "Peaceful picketing that doesn't block entry", "Employees discussing their pay with each other"], 0, "Wildcat strikes are unauthorized by the union, and the strikers can be fired.")),
    MC("ch29", T("Under ERISA, an employee's own contributions to a pension plan vest immediately.", true, "Slide 24.")),
    MC("ch30", T("Title VII applies to employers with 15 or more employees.", true, "Also unions with 15+ members and governments.")),
    MC("ch30", T("The ADEA protects workers age 40 and older at employers with 20 or more employees.", true, "Slide 35.")),
    MC("ch30", T("An employee may sue under Title VII without first filing a charge with the EEOC.", false, "The EEOC charge (within 180 days) comes first.")),
    MC("ch30", C("Northern Airlines hires only male cabin attendants to serve the growing number of female executives who fly. Which is correct?", ["Sex isn't a BFOQ here, so the policy violates Title VII", "Sex is a valid BFOQ for cabin attendants", "The policy is lawful because it doesn't involve race", "Only the Equal Pay Act applies"], 0, "Customer preference isn't a BFOQ.")),
    MC("ch30", T("Disparate treatment is unintentional discrimination.", false, "Treatment is intentional. Impact is usually unintentional.")),
    MC("ch30", C("Each of the following is a protected class under Title VII EXCEPT:", ["Age", "Religion", "National origin", "Sex"], 0, "Age is covered by the ADEA.")),
    MC("ch30", T("Under the ADA, an employer may ask a job applicant whether he has a disability.", false, "Only about the ability to perform job functions.")),
    MC("ch30", T("Pregnancy discrimination is a form of sex discrimination under Title VII.", true, "The Pregnancy Discrimination Act of 1978.")),
    MC("ch30", C("A supervisor harasses an employee but takes no tangible employment action. The employer can avoid liability by showing:", ["It had an anti-harassment policy and complaint procedure that employees were told about", "The supervisor acted without the employer's knowledge", "The employee was employed at will", "It has fewer than 50 employees"], 0, "The affirmative defense on slide 28.")),
    MC("ch30", T("Members of a majority group may sue for reverse discrimination under Title VII.", true, "Slide 19.")),
    MC("ch7", T("A grand jury decides whether there is enough evidence to charge a defendant.", true, "It issues an indictment.")),
    MC("ch7", T("A petit jury issues an indictment.", false, "The grand jury indicts. The petit jury decides guilt at trial.")),
    MC("ch7", T("Reasonable suspicion is enough for an officer to stop and frisk someone.", true, "Slide 11.")),
    MC("ch7", T("Clear and convincing evidence is the standard needed to convict in a criminal case.", false, "Beyond a reasonable doubt.")),
    MC("ch7", C("Which of the following is an exception to the search warrant requirement?", ["Plain view", "Consent", "The automobile exception", "All of the above"], 3, "Slide 19.")),
    MC("ch7", T("Evidence derived from an illegal search may be suppressed as \"fruit of the poisonous tree.\"", true, "Slide 20.")),
    MC("ch7", C("A scammer posing as a vendor emails a company's accounts payable clerk and gets an invoice paid into a fake account. This is:", ["Business Email Compromise", "Embezzlement", "A RICO violation", "An FCPA violation"], 0, "Slide 35.")),
    MC("ch7", T("The Federal Sentencing Guidelines are optional suggestions that federal judges may ignore.", false, "The slide describes them as rules judges must follow.")),
    MC("ch7", T("A conspiracy conviction requires an agreement and an overt act, even if the planned crime is never completed.", true, "Slide 30.")),
    MC("ch7", T("A nolo contendere plea can be used as evidence of liability in a later civil trial.", false, "It can't (slide 16).")),
    MC("ch27", T("GAAP are the rules for conducting audits.", false, "GAAS is for conducting audits. GAAP is for preparing statements.")),
    MC("ch27", T("The Sarbanes-Oxley Act created the Public Company Accounting Oversight Board.", true, "Slide 2.")),
    MC("ch27", T("Under SOX, an accounting firm that audits a public company may also do that company's bookkeeping.", false, "Bookkeeping is on the banned-consulting list.")),
    MC("ch27", C("An accountant negligently prepares statements knowing First Bank will rely on them. The client shows them to a landlord instead. Under the Restatement view, the accountant is:", ["Not liable, because a landlord isn't in the same class as a lender", "Liable, because the landlord's use was foreseeable", "Liable, because every user of the statements is covered", "Not liable, because only fraud creates liability to third parties"], 0, "Slide 20.")),
    MC("ch27", T("Under the Ultramares doctrine, an accountant who commits fraud can be liable to third parties it didn't know about.", true, "Gross negligence or fraud removes the privity limit.")),
    MC("ch27", C("Which audit opinion means the auditor lacked enough information to form an opinion?", ["Disclaimer", "Adverse", "Qualified", "Unqualified"], 0, "Slide 8.")),
    MC("ch27", T("To win a §10(b) claim, an investor must prove the auditor acted with scienter.", true, "Knowingly or recklessly, with intent to deceive.")),
    MC("ch27", T("Federal law recognizes an accountant-client privilege.", false, "Many states do. Federal law doesn't.")),
    MC("ch36", C("Which of the following allowed claims will be paid first from the debtor's estate in a Chapter 7 bankruptcy?", ["The trustee's expenses of $3,000", "A state claiming $5,000 in back taxes", "Employees claiming $4,000 in wages earned within 90 days of filing", "A gap creditor with a claim of $2,000"], 0, "Administrative expenses rank first among priority claims." + TB)),
    MC("ch36", T("Chapter 7 bankruptcy is a reorganization.", false, "Chapter 7 is liquidation.")),
    MC("ch36", T("The automatic stay takes effect the moment the petition is filed.", true, "Slide 7.")),
    MC("ch36", T("Payments to insiders are subject to the same 90-day preference period as payments to other creditors.", false, "Insiders have a 1-year look-back.")),
    MC("ch36", C("Which of the following debts are NOT discharged in bankruptcy?", ["Income taxes", "Money obtained fraudulently", "Debts omitted from the schedules", "All of the above"], 3, "Slide 20.")),
    MC("ch36", T("In Chapter 13, the debtor's repayment plan must be filed within 15 days of the petition.", true, "Slide 26.")),
    MC("ch36", T("A debtor who received a discharge may file for bankruptcy again after 2 years.", false, "The slide says 8 years.")),
    MC("ch36", T("Organizations, as well as individuals, may keep exempt property in bankruptcy.", false, "Exemptions are for individual debtors only.")),
    MC("ch40", T("The Clean Air Act allows citizens to sue polluters and to sue the EPA for failing to enforce the law.", true, "Slide 7.")),
    MC("ch40", T("Under the Oil Pollution Act, a polluter may be liable for cleanup costs but not for economic losses suffered by others.", false, "Restitution for economic losses is one of the three OPA categories.")),
    MC("ch40", T("The Clean Water Act set a goal of making navigable waters suitable for swimming and fishing.", true, "Slide 14.")),
    MC("ch40", C("What could happen if a company violates an environmental law?", ["Civil penalties", "Criminal penalties, including imprisonment", "Reputational damage", "All of the above"], 3, "Slides 5 and 36.")),
    MC("ch40", T("Under CERCLA, polluters are jointly and severally liable unless they can show they caused only a portion of the damage.", true, "Slide 19.")),
    MC("ch40", T("RCRA governs the cleanup of existing hazardous waste sites.", false, "CERCLA (Superfund) governs cleanup. RCRA regulates waste going forward.")),
    MC("ch40", C("Which law requires an Environmental Impact Statement?", ["NEPA", "The Endangered Species Act", "TSCA", "RCRA"], 0, "Slide 24."))
  ]});
})();
