/* eslint-disable  */
import React, { useState } from 'react'
import {
	Button,
	CircularProgress,
	Grid,
	TextField,
	Dialog,
	DialogContent,
	Box,
	Typography,
} from '@material-ui/core'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useMutation } from '@apollo/client'

import { APPROVE_IMPORT_COLLECTION_REQUEST } from '../../graphql/mutation/admin'
import { useStyles } from './ModalStyles'
import { ReactComponent as CloseIcon } from '../../Assets/Svg/close.svg'
import './styles.scss'

const validationSchema = yup.object({
	count: yup.number().min(0).max(1001).required('This field is required.'),
})

const CreateProfileVerificationModal = ({
	id,
	open,
	handleClose,
	heading,
	button1,
	setActionPerformed,
}) => {
	const classes = useStyles()
	const [errorMsg, setErrorMsg] = useState('')
	const [loading, setLoading] = useState(false)
	const [approveCollection] = useMutation(APPROVE_IMPORT_COLLECTION_REQUEST)

	const handleVerification = async (data) => {
		try {
			setLoading(true)
			const response = await approveCollection({
				variables: {
					input: {
						...data,
					},
				},
			})
			const { message, status } = response.data.importCollection
			if (status === 'error') {
				console.log(message)
				return
			}
			handleClose()
			setActionPerformed()
			
			setLoading(false)
		} catch (err) {
			console.log(err)
			setLoading(false)
			setErrorMsg('Something went wrong !')
		}
	}

	const formik = useFormik({
		initialValues: {
			count: '',
			id,
		},
		enableReinitialize: true,
		validationSchema,
		onSubmit: (values) => {
			handleVerification(values)
		},
	})

	return (
		<>
			<Dialog
				open={open}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				maxWidth="sm"
				classes={{ paper: classes.dialogPaper1 }}
			>
				<DialogContent classes={{ root: classes.dialogContext }}>
					<div
						role="button"
						tabIndex={0}
						onKeyDown={handleClose}
						onClick={handleClose}
						className={classes.topBar}
					>
						<span className={classes.title}>{heading}</span>
						<span
							className={`${classes.onHover} ${classes.closeBtn}`}
						>
							<CloseIcon />
						</span>
					</div>
					<Box
						className={classes.phoneContainer}
						id="alert-dialog-description"
					>
						<form
							noValidate
							autoComplete="off"
							onSubmit={formik.handleSubmit}
						>
							<Grid container style={{ marginTop: '5vh' }}>
								<Grid item xs={2} sm={2} md={2} xl={2} />
								<Box className={classes.dFlex4}>
									<TextField
										id="count"
										name="count"
										type="number"
										placeholder="Enter number of NFT's to approve"
										variant="outlined"
										className={classes.width100}
										value={formik.values.count}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										error={
											formik.touched.count &&
											Boolean(formik.errors.count)
										}
										helperText={
											formik.touched.count &&
											formik.errors.count
										}
										InputProps={{
											classes: {
												input: classes.placeHolder,
											},
											className: classes.inputHeight3,
										}}
									/>
								</Box>
								{errorMsg.length > 0 && (
									<Typography
										variant="subtitle1"
										className={classes.errorText}
									>
										{errorMsg}
									</Typography>
								)}
								<Typography
									variant="subtitle1"
									className={classes.errorText}
								>
									Note : Don't approve more than 1000 NFTs.
								</Typography>
								{/* <Grid item xs={1} sm={2} md={2} xl={2} /> */}
							</Grid>
							<Grid
								item
								style={{
									display: 'flex',
									justifyContent: 'space-evenly',
									marginTop: '4vh',
									marginBottom: '40px',
								}}
							>
								<Button
									variant="contained"
									size="small"
									style={{
										width: '155px',
										height: '40px',
										fontWeight: '550',
										color: 'white',
										boxShadow: 'none',
										fontSize: '14px',
									}}
									type="submit"
									disabled={loading?true:false}
									className={classes.sendButton}
								>
									{loading && (
										<CircularProgress
											size={20}
											style={{ color: 'white' }}
										/>
									)}
									{!loading && button1}
								</Button>
							</Grid>
						</form>
					</Box>
				</DialogContent>
			</Dialog>
		</>
	)
}
export default CreateProfileVerificationModal
