import { Link, NavLink } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { logout } from '../../store/actions/user.actions'
import ColorThief from 'colorthief'
import { useEffect, useRef, useState } from 'react'
import { Modal } from '../Modal'
import { addBoard } from '../../store/actions/board.actions'
import { boardService } from '../../services/board'
import { AddBoard } from '../workspace/modals/AddBoard'
import { Dropdown } from './Dropdown'
import { darkenColor, lightenColor } from '../../services/util.service'
import { HomePageHeader } from './HomePageHeader'
import ClickOutside from '../ClickOutside'

export function AppHeader() {
    const user = useSelector((storeState) => storeState.userModule.user)
    const board = useSelector((storeState) => storeState.boardModule.board)
    const headerRef = useRef()
    const inputRef = useRef()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [whichModal, setWhichModal] = useState('')
    const [position, setPosition] = useState()
    const [inputClass, setInputClass] = useState('')
    const [bgClr, setBgClr] = useState()

    const navigate = useNavigate()
    const location = useLocation()
    function onCloseModal() {
        setIsModalOpen(false)
        setWhichModal('')
    }
    function onToggleModal(modalChoice) {
        if (modalChoice === whichModal) {
            setIsModalOpen(false)
            setWhichModal('')
            return
        }
        setIsModalOpen(true)
        setWhichModal(modalChoice)
    }

    async function onLogout() {
        try {
            await logout()
            navigate('/')
            showSuccessMsg(`Bye now`)
        } catch (err) {
            showErrorMsg('Cannot logout')
        }
    }

    /*    useEffect(() => {
        if (board && board.urls) {
            setHeaderColorFromImage(board.urls.regular)
        } else {
            headerRef.current.style.cssText = ''
        }
    }, [board.style]) */
    useEffect(() => {
        if (!headerRef.current) return
        if (isModalOpen) headerRef.current.style.zIndex = '5'
        else headerRef.current.style.zIndex = '3'
    }, [isModalOpen])
    function setHeaderColorFromImage(imgSrc) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = imgSrc

        img.onload = () => {
            const colorThief = new ColorThief()
            const [r, g, b] = colorThief.getColor(img)
            const baseColor = `rgba(${r}, ${g}, ${b}, 0.9)`
            // Set as header background color with some transparency
            const style = { backgroundColor: `${darkenColor(baseColor, 40)}` }
            const ligherColor = lightenColor(`rgba(${r}, ${g}, ${b}, 0.9)`, 20)

            const inputStyle = { backgroundColor: ligherColor }
            setBgClr(`rgba(${r}, ${g}, ${b}, 0.9)`)
            Object.assign(headerRef.current.style, style)
            // Object.assign(inputRef.current.style, inputStyle)
        }
    }
    async function onAddBoard(board) {
        if (!board) {
            const board = boardService.getEmptyBoard()
            board.title = prompt('TITLE?')
        }

        try {
            const savedBoard = await addBoard(board)
            navigate(`/board/${savedBoard._id}`)
            // showSuccessMsg(`Board added (id: ${savedBoard._id})`)
        } catch (err) {
            showErrorMsg('Cannot add board')
        } finally {
            setIsModalOpen(false)
            // nav
        }
    }

    function onSetPosition(ev) {
        // Get button position

        const rect = ev.target.getBoundingClientRect()
        setPosition({ left: rect.left, top: rect.bottom + 10 })
    }

    function getModalContent() {
        switch (whichModal) {
            case 'create board':
                return <AddBoard onAddBoard={onAddBoard} position={position} />
            case '':
                return null
            default:
                return <Dropdown title={whichModal} />
        }
    }
    function handleBlur() {
        setInputClass('')
    }
    function handleFocus() {
        setInputClass('enlarged')
    }
    /*  let inputStyle = ''
    if (bgClr) {
        inputStyle = inputClass ? { backgroundColor: 'white' } : { backgroundColor: lightenColor(bgClr) }
    }
    if (!inputClass) return */
    // const inputStyle = ''
    return (
        <header ref={headerRef} className="app-header full">
            <nav>
                <NavLink to="/home" className="homepage-link">
                    <NineDots />
                </NavLink>
                <NavLink to="workspace/home" className="logo">
                    <img src="/img/general/trello-logo-static.gif" alt="" />
                    Yeyllo
                </NavLink>
                {location.pathname !== '/home' ? <HeaderMainNav /> : <HomePageHeader />}

                {/*   {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}

                {!user && (
                    <NavLink to="login" className="login-link">
                        Login
                    </NavLink>
                )}
                {user && (
                    <div className="user-info">
                        <Link to={`user/${user._id}`}>
                            {user.imgUrl && <img src={user.imgUrl} />}
                            {user.fullname}
                        </Link>
                        <span className="score">{user.score?.toLocaleString()}</span>
                        <button onClick={onLogout}>logout</button>
                    </div>
                )} */}
            </nav>
            {location.pathname !== '/home' && (
                <>
                    <div className={`header-search-wrapper ${inputClass}`}>
                        <span className="search-icon">
                            <img src="/img/general/search-icon.svg" alt="" />
                        </span>
                        <input
                            type="text"
                            className={`input header-search `}
                            placeholder="search"
                            ref={inputRef}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        // style={inputStyle}
                        />
                    </div>

                    {isModalOpen && (
                        <ClickOutside onClick={onCloseModal} className={'absoluteapp'}>
                            <Modal
                                title={whichModal}
                                onCloseModal={onCloseModal}
                                isOpen={isModalOpen}
                                isBlur={false}
                                position={position}
                                isBackDrop={false}
                            >
                                {getModalContent()}
                            </Modal>
                        </ClickOutside>
                    )}
                </>
            )}
        </header>
    )
    function HeaderMainNav() {
        return (
            <>
                <button
                    className="btn1 header-btn recent"
                    onClick={(ev) => {
                        onToggleModal('recent')
                        if (!isModalOpen) {
                            onSetPosition(ev)
                        }
                    }}
                >
                    Recent
                    <ArrowDown />
                </button>

                <button
                    className="btn1 header-btn starred"
                    onClick={(ev) => {
                        onToggleModal('starred')
                        if (!isModalOpen) {
                            onSetPosition(ev)
                        }
                    }}
                >
                    Starred
                    <ArrowDown />
                </button>

                <button
                    className="btn1 header-btn template"
                    onClick={(ev) => {
                        onToggleModal('templates')
                        if (!isModalOpen) {
                            onSetPosition(ev)
                        }
                    }}
                >
                    Templates
                    <ArrowDown />
                </button>

                <button
                    className="btn1 create"
                    onClick={(ev) => {
                        onToggleModal('create board')
                        if (!isModalOpen) {
                            onSetPosition(ev)
                        }
                    }}
                >
                    create
                </button>
            </>
        )
    }
}
function ArrowDown() {
    return (
        <svg width="16" height="16" role="presentation" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M11.2929 16.7071L4.22185 9.63606C3.83132 9.24554 3.83132 8.61237 4.22185 8.22185C4.61237 7.83133 5.24554 7.83133 5.63606 8.22185L12 14.5858L18.364 8.22185C18.7545 7.83132 19.3877 7.83132 19.7782 8.22185C20.1687 8.61237 20.1687 9.24554 19.7782 9.63606L12.7071 16.7071C12.3166 17.0977 11.6834 17.0977 11.2929 16.7071Z"
                fill="currentColor"
            />
        </svg>
    )
}
function NineDots() {
    return (
        <svg width="20" height="20" role="presentation" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                d="M4 5C4 4.44772 4.44772 4 5 4H7C7.55228 4 8 4.44772 8 5V7C8 7.55228 7.55228 8 7 8H5C4.44772 8 4 7.55228 4 7V5ZM4 11C4 10.4477 4.44772 10 5 10H7C7.55228 10 8 10.4477 8 11V13C8 13.5523 7.55228 14 7 14H5C4.44772 14 4 13.5523 4 13V11ZM11 4C10.4477 4 10 4.44772 10 5V7C10 7.55228 10.4477 8 11 8H13C13.5523 8 14 7.55228 14 7V5C14 4.44772 13.5523 4 13 4H11ZM10 11C10 10.4477 10.4477 10 11 10H13C13.5523 10 14 10.4477 14 11V13C14 13.5523 13.5523 14 13 14H11C10.4477 14 10 13.5523 10 13V11ZM17 4C16.4477 4 16 4.44772 16 5V7C16 7.55228 16.4477 8 17 8H19C19.5523 8 20 7.55228 20 7V5C20 4.44772 19.5523 4 19 4H17ZM16 11C16 10.4477 16.4477 10 17 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H17C16.4477 14 16 13.5523 16 13V11ZM5 16C4.44772 16 4 16.4477 4 17V19C4 19.5523 4.44772 20 5 20H7C7.55228 20 8 19.5523 8 19V17C8 16.4477 7.55228 16 7 16H5ZM10 17C10 16.4477 10.4477 16 11 16H13C13.5523 16 14 16.4477 14 17V19C14 19.5523 13.5523 20 13 20H11C10.4477 20 10 19.5523 10 19V17ZM17 16C16.4477 16 16 16.4477 16 17V19C16 19.5523 16.4477 20 17 20H19C19.5523 20 20 19.5523 20 19V17C20 16.4477 19.5523 16 19 16H17Z"
                fill="currentColor"
            />
        </svg>
    )
}
