import React, { useState, useEffect } from 'react'
import { Input, Button, Checkbox, Link } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'

import style from './style.css'

type Props = {
  textButton?: string
  textNextStep: string
  textAlreadyRegistered: string
  linkPrivacy: string
}

const LoginForm: StorefrontFunctionComponent<Props> = ({
  textButton = 'Register',
  textNextStep = 'Sign up to track your products and check our promotions',
  textAlreadyRegistered = 'You are already a registered user',
  linkPrivacy = '/informacja-o-ochronie-prywatnosci',
}) => {
  const { navigate } = useRuntime()
  const [registerFormVisible, setRegisterFormVisible] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [nameValue, setNameValue] = useState('')
  const [surnameValue, setSurnameValue] = useState('')
  const [consent, setConsent] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formFilled, setFormFilled] = useState(false)

  const putNewUser = (email: string, name?: string, surname?: string) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName: name,
        lastName: surname,
        isNewsletterOptIn: consent,
      }),
    }

    const fetchUrlPatch = '/_v/wrapper/api/user'

    return fetch(fetchUrlPatch, options).then((response) => response.json())
  }

  const getIdUser = (email: string) => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const fetchUrl = `/_v/wrapper/api/user/email/userinfo?email=${email}`

    return fetch(fetchUrl, options).then((response) => response.json())
  }

  const hideFirstOr = () => {
    const gotTextOr = Array.from(
      document.getElementsByClassName(
        'vtex-rich-text-0-x-container--login-content-separede'
      ) as HTMLCollectionOf<HTMLElement>
    )[0]

    gotTextOr.style.display = 'none'
  }

  const handleSubmit = (e: any) => {
    setLoading(true)
    e.preventDefault()
    e.stopPropagation()
    getIdUser(emailValue).then((User: any) => {
      if (User.length > 0) {
        setLoading(false)
        setSuccess(true)
        setAlreadyRegistered(true)
      } else {
        putNewUser(emailValue, nameValue, surnameValue).then(
          (repsonse: any) => {
            setLoading(false)
            // eslint-disable-next-line vtex/prefer-early-return
            if (repsonse.Message === undefined) {
              setRegisterFormVisible(true)
              window.sessionStorage.setItem(
                'registerFormVisible',
                JSON.stringify(true)
              )
              navigate({
                to: `/login?flowState=createPass&userEmail=${emailValue}`,
                params: {
                  flowState: 'createPass',
                  userEmail: emailValue,
                },
              })

              setTimeout(() => {
                setRegisterFormVisible(true)
                hideFirstOr()
                window.location.reload()
              }, 1)
              setRegisterFormVisible(true)
              hideFirstOr()
            }
          }
        )
      }
    })
  }

  useEffect(() => {
    const filled = nameValue && surnameValue && emailValue

    console.log('filled', formFilled)

    setFormFilled(!!filled)
  }, [nameValue, surnameValue, emailValue])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const paramValue = queryParams.get('userEmail')

    if (paramValue === null) {
      setRegisterFormVisible(false)
    } else {
      const storageValue = window.sessionStorage.getItem('registerFormVisible')
      const initialValue =
        storageValue !== null ? JSON.parse(storageValue) : null

      const registerFormVisibleform =
        initialValue !== null && initialValue !== undefined
          ? initialValue
          : false

      if (initialValue) {
        hideFirstOr()
      }

      setRegisterFormVisible(registerFormVisibleform)
    }
  }, [])

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {!registerFormVisible ? (
        <div className={style.formContainer}>
          <div className={style.infoContainer}>{textNextStep}</div>
          <div>
            <form onSubmit={handleSubmit}>
              <div>
                <div className={style.inputContainer}>
                  <Input
                    value={nameValue}
                    placeholder="Name *"
                    onChange={(e: any) => setNameValue(e.target.value)}
                    required
                  />
                </div>
                <div className={style.inputContainer}>
                  <Input
                    value={surnameValue}
                    placeholder="Surname *"
                    onChange={(e: any) => setSurnameValue(e.target.value)}
                    required
                  />
                </div>
                <div className={style.inputContainer}>
                  <Input
                    placeholder="E-mail *"
                    value={emailValue}
                    type="email"
                    onChange={(e: any) => setEmailValue(e.target.value)}
                    required
                  />
                </div>
                <div className={style.informativa}>
                  <p className={style.privacy}>
                    I have read and understood the content of the information on
                    the protection of personal data and the
                    <span className={style.colorEdb112}>
                      <a
                        className={style.link}
                        href={linkPrivacy}
                        target="_blank"
                        rel="noreferrer"
                      >
                        &nbsp;Regulations of the store:
                      </a>
                    </span>
                  </p>
                  <Checkbox
                    checked={consent}
                    id="consent-check"
                    label="I consent to the processing of my personal data in order to enable Whirlpool Polska Appliances Sp. z o. o. to send me a newsletter/marketing messages (in electronic and non-electronic form, including via telephone, traditional mail, e-mail, SMS, MMS, push notifications on third party websites, including Facebook and Google platforms) regarding products and services of Whirlpool Polska Appliances Sp. z o. o. also those already purchased or registered by me, as well as for the purpose of conducting market research"
                    name="default-checkbox-group"
                    onChange={(e: any) => {
                      setConsent(e.target.checked)
                    }}
                    required={false}
                    value={consent}
                  />
                </div>
              </div>
              <div
                className={`${style.buttonContainer} ${
                  formFilled ? style.buttonContainerDisabled : ''
                }`}
              >
                {!loading ? (
                  !success ? (
                    <Button
                      type="submit"
                      id="registration_user_button"
                      disabled={!formFilled}
                    >
                      {textButton}
                    </Button>
                  ) : alreadyRegistered ? (
                    <div>
                      <span className={style.registered}>
                        {textAlreadyRegistered}
                      </span>
                      <Link href="/login?returnUrl=/account">Login</Link>
                    </div>
                  ) : null
                ) : (
                  <div className={style.loaderForm} />
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}

LoginForm.schema = {
  title: 'Login Form',
  description: 'Login form',
  type: 'object',
  properties: {
    textButton: {
      title: 'CTA',
      type: 'string',
      description: 'Text for the CTA Button',
      default: '',
    },
    textNextStep: {
      title: 'textNextStep',
      type: 'string',
      description: 'Text for next step label',
      default: '',
    },
    linkPrivacy: {
      title: 'Link to privacy page',
      description: 'url privacy page',
      default: '',
      type: 'string',
    },
    textAlreadyRegistered: {
      title: 'textAlreadyRegistered',
      type: 'string',
      description: 'Testo utente registrato',
      default: '',
    },
  },
}

export default LoginForm
