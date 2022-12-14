import { useEffect, useState } from "react";
import { Framework } from "@superfluid-finance/sdk-core";
import { useAccount, useProvider, useSigner } from 'wagmi'
import { abi } from '../../abi/supertoken.js'
import styled from 'styled-components'
import axios from 'axios'
import { moralisApiConfig } from '../../data/moralisApiConfig'

import Address from "../../components/functional/Address"
import ButtonAlt from "../../components/buttons/ButtonAlt";
import Subtitle from "../../components/typography/Subtitle";
import ApproveUniversal from "../../components/buttons/ApproveUniversal";
import StreamCounter from "../../components/functional/StreamCounter";

const Container = styled.div`
  padding-left: 1%;
  padding-right: 1%;
  padding-top: 5%;
  min-height: 300px;
`
// TBD component to display current stream - Destination, Flow, Amount sent
const StreamComponent = styled.div`
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between ;
  width: 100%;

  padding-left: 10%;
  min-height: 280px;
`

const Title = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  font-size: 1.1em;
`

const ValueRow = styled.div`
  width: 100%;
  display: flex; 
  flex-direction: row;
  justify-content: space-between;
  background: rgba(107, 255, 255, 0.05);
  border-radius: 15px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 1em;
  line-height: 23px;
  margin: 1%;
  padding: 1.4%;
  padding-left: 10px;
  padding-right: 10px;
  color: #B0F6FF;
`

const ButtonBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 4%;
  width: 100%;
`
// TBD component to create a stream 
// With new Superfluid stream, it's needed to call axios as well

const Input = styled.input`
  background: inherit;
  border: none;
  box-shadow: 0px 4px 20px rgba(255, 255, 255, 0.2);
  width: 150px;
  padding-left: 10px;
  padding-right: 10px;
`

const ActiveValue = styled.div`
  color: white;
  min-width: 150px;
`

const RowItem = styled.div`
  width: 33%;
`

const RowRightItem = styled(RowItem)`
  text-align: right;
`

const ErrorBox = styled.div`
  color: red;
  font-size: 0.8em;
  font-family: 'Neucha';
`

const A = styled.a`
  color: green;
  text-decoration: underline;
  margin-left: 5px;
  &:hover{
    cursor: pointer;
    opacity: 0.9;
  }
`

const SuperRef = styled.div`
  color: #B0F6FF;
  font-family: 'Neucha';
  text-decoration: underline;
  opacity: 0.7;
  transition: 0.2s;
  &:hover{
    opacity: 1;
  }
`


const Stream = ({ objectId, recipient }) => {
  const { address } = useAccount();
  const [apiError, setApiError] = useState(false)
  const [flowRate, setFlowRate] = useState(0);
  const provider = useProvider()
  const { data: signer } = useSigner()
  const [streamFound, setStreamFound] = useState(false)
  const [streamData, setStreamData] = useState()
  const [deposit, setDeposit] = useState(0)
  const [owedDeposit, setOwedDeposit] = useState(0)
  const [superfluidError, setSuperfluidError] = useState(false)
  const [newStream, setNewStream] = useState(false)
  const [displayRate, setDisplayRate] = useState(50)

  const getFlowData = async () => {
    // Key service to retrieve current deposit 
    const sf = await Framework.create({
      provider: provider,
      chainId: 80001
    })
    const DAIxContract = await sf.loadSuperToken("fDAIx");
    const DAIx = DAIxContract.address;
    /// TBD need to repair to get actual balance 
    /// TBD find simple way how to find address
    /// TBD pass correct values to the form and send to Superfluid & Moralis 
    try {
      const flow = await sf.cfaV1.getFlow({
        superToken: DAIx,
        sender: address,
        receiver: "0xcfA132E353cB4E398080B9700609bb008eceB125",
        providerOrSigner: provider
      })
      console.log(flow)
      if (flow.flowRate !== '0') {
        setDeposit(flow.deposit)
        setOwedDeposit(flow.owedDeposit)
        console.log(deposit)
        console.log(owedDeposit)
        setFlowRate(flow.flowRate)
      }
    } catch (err) {
      console.log(err)
      setSuperfluidError("Stream not found")
    }
  }



  /// TBD - Update Moralis DB together with the streams on chain
  const addStreamState = async (oid) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_DAPP}/classes/Stream`, {
        'project': oid,
        'flowRate': flowRate,
        'owner': "0xcfA132E353cB4E398080B9700609bb008eceB125",
        'isActive': true,
        'addressBacker': address,
      }, moralisApiConfig)
      setApiError(false)
    } catch (error) {
      console.log(error)
      setApiError(true)
    }
  }

  const getStreamState = async (oid) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_DAPP}/classes/Stream?where={"projectId":"${oid}", "isActive": true }`, moralisApiConfig)
      if (res.data.results.length > 0) {
        setStreamFound(true)
        setStreamData(res.data.results)
        for (let i = 0; i < res.data.results.length; i++) {
          if (res.data.results[i].flowRate) {
            /// Error here - For each array item add number to the displayRate total
            setDisplayRate(displayRate + res.data.results[i].flowRate)
            console.log(displayRate)
          }
        }
        // Set display rate, aggregation of all streams
      } else {
        setStreamFound(false)
      }
      setApiError(false)
    } catch (error) {
      console.log(error)
      setApiError(true)
    }
  }

  const deleteStreamState = async (oid) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_DAPP}/classes/Stream`, {
        'projectId': { oid },
        'isActive': false
      }, moralisApiConfig)
      setApiError(false)
    } catch (error) {
      console.log(error)
      setApiError(true)
    }
  }

  useEffect(() => {
    getStreamState(objectId);
  }, [])

  async function startStream() {
    const sf = await Framework.create({
      provider: provider,
      chainId: 80001
    })

    const DAIxContract = await sf.loadSuperToken("fDAIx");
    const DAIx = DAIxContract.address;
    const amount = flowRate.toString();
    try {
      const createFlowOperation = sf.cfaV1.createFlow({
        sender: address,
        receiver: "0xcfA132E353cB4E398080B9700609bb008eceB125",
        flowRate: amount,
        superToken: DAIx
      });

      const result = await createFlowOperation.exec(signer);
      console.log("Success" + result);
      await addStreamState(objectId)
      setApiError(false)
      await setNewStream(false)
      await setStreamFound(true)
    } catch (error) {
      console.log(
        "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
      );
      console.error(error);
      setApiError(true)
      console.log(address, recipient, amount, DAIx)
    }
  }

  async function deleteFlow() {
    const sf = await Framework.create({
      provider: provider,
      chainId: 80001
    })
    const DAIxContract = await sf.loadSuperToken("fDAIx");
    const DAIx = DAIxContract.address;
    try {
      const deleteFlowOperation = sf.cfaV1.deleteFlow({
        sender: address,
        receiver: recipient,
        superToken: DAIx
      });

      console.log("Deleting your stream...");

      await deleteFlowOperation.exec(signer);
      await deleteStreamState(objectId)

    } catch (error) {
      console.error(error);
    }
  }

  return <>
    <Container>
      <StreamComponent>
        {newStream ? <>
          <Title><Subtitle text={'New stream'} /></Title>
          <ErrorBox>
       Highly experimental feature - accepts only
  <A href='https://docs.superfluid.finance/superfluid/developers/super-tokens/super-token-faucet' rel="noopener noreferrer" target="_blank">Super token</A> 
        </ErrorBox>
          <ValueRow>
            <RowItem>Recipient</RowItem>
            <RowItem>
              <ActiveValue><Address address={'0xcfA132E353cB4E398080B9700609bb008eceB125'} /></ActiveValue>
            </RowItem>
            <RowRightItem>Address</RowRightItem>
          </ValueRow>

          <ValueRow>
            <RowItem>Flow rate</RowItem>
            <RowItem>
              <Input type='number' placeholder='enter flow rate' onChange={(e) => { setFlowRate(e.target.value) }} />
            </RowItem>
            <RowRightItem>dai/mo</RowRightItem>
          </ValueRow>

          <ButtonBox>
            <ApproveUniversal tokenContract={'0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f'} spender={'0xcfA132E353cB4E398080B9700609bb008eceB125'} amount={flowRate} />
            <ButtonAlt width={'100px'} text='Start' onClick={() => (startStream())} /></ButtonBox>
          {apiError && <ErrorBox>Insufficient funds, no approval, or owner = backer</ErrorBox>}

        </> : <>
          {streamFound ? <>
            <Title><Subtitle text={'Overview'} /></Title>
            <ValueRow>
              <RowItem>Flow rate</RowItem>
              <RowItem>
                <ActiveValue>{displayRate}</ActiveValue>
              </RowItem>
              <RowRightItem>dai/mo</RowRightItem>
            </ValueRow>

            <ValueRow>
              <RowItem>Deposited</RowItem>
              <RowItem>
                <ActiveValue><StreamCounter startValue={deposit} endValue={displayRate} /></ActiveValue>
              </RowItem>
              <RowRightItem>Value</RowRightItem>
            </ValueRow>
            <ButtonBox>
             {address && recipient !== address ? <ButtonAlt width={'100%'} text='Start stream!'  /> : <ButtonAlt width={'100%'} text='You cannot stream to your own project' />}
            </ButtonBox>
          </> : <> 
          <Title><Subtitle text={'No active stream found'} /></Title>
              <ButtonBox>
                  <ButtonAlt width={'100%'} text='Start stream!'/>
              </ButtonBox>
              </>
          }
        </>}
        <ButtonBox>
               <a href='https://app.superfluid.finance' rel="noopener noreferrer" target="_blank">  
                <SuperRef>Manage your streams in Superfluid App</SuperRef>
               </a>
            </ButtonBox>
      </StreamComponent>
    </Container>
  </>
}

export default Stream;