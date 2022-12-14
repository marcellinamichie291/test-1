import styled from 'styled-components'
import { RewardIcon } from '../icons/Common'
import { Erc20ActiveIcon, Erc20Icon, NftActiveIcon, NftIcon } from '../icons/Project'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 3%;
  color: white;
  padding: 0.5%;
 
  width: 40%;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const Inactive = styled.div`
    font-size: 0.9em;
    font-family: 'Montserrat';
    cursor: pointer;
    transition: 0.2s;
    box-shadow: 0px 0px 0px 0px #ffffff;
    padding-bottom: 1%;
    &:hover{
        opacity: 0.8;
    }
    @media (min-width: 1768px) {
        font-size: 1.1em;
    }
`

const Active = styled(Inactive)`
    color: #b0f6ff;
`

const Divider = styled.div`
    width: 1px;
    height: 10px;
    background: #3a3a3a;
`

const Tab = ({ active, o1, o2, o3, o4, o5, change1, change2, change3, change4, change5 }) => {

    const Item = ({ act, text, onClick }) => {
        return <>{active === act ? 
            <Active>
                {text === 'Classic' && <RewardIcon width={150} />} 
                {text === 'ERC20' && <Erc20ActiveIcon width={150} />}
                {text === 'ERC1155' && <NftActiveIcon width={150} />}
                {text !== 'ERC20' && text !== 'ERC1155' && text !== 'Classic' && <>{text}</> }
            </Active> : 
            <Inactive onClick={onClick}>
                {text === 'Classic' && <RewardIcon width={150} />} 
                {text === 'ERC20' && <Erc20Icon width={150} />}
                {text === 'ERC1155' && <NftIcon width={150} />}
                {text !== 'ERC20' && text !== 'ERC1155' && text !== 'Classic' && <>{text}</> }
            </Inactive>
        }</>
    }
    return <Container>
        <Item act={o1} text={o1} onClick={change1} />
        <Divider />
        <Item act={o2} text={o2} onClick={change2} />

        {o3 && <>  <Divider /><Item act={o3} o={o3} text={o3} onClick={change3} /></>}
        {o4 && <>  <Divider /><Item act={o4} o={o4} text={o4} onClick={change4} /></>}
        {o5 && <>  <Divider /><Item act={o5} o={o5} text={o5} onClick={change5} /></>}
    </Container>
}

export default Tab