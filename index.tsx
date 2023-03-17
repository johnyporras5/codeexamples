import React from "react";
import * as Mui from "@material-ui/core";
import { SelectAgentDialog } from "../select-agent-dialog"
import { GeographicRoute as ModelGeographicRoute } from "model/geographic-route";


interface Props 
{}

interface State {
	addAgentIsOpen: boolean
	goegraphicRoute: ModelGeographicRoute | null
}

class Component extends React.Component<Props, State> {
	public constructor(props: Props) {
		super(props);
		this.state = {
			addAgentIsOpen: false,
			goegraphicRoute:null,
		};
	}

	public render() {
		const {
			addAgentIsOpen,
			goegraphicRoute
		} = this.state;
		return (
			
				<Mui.Grid container item xs={12} md={12}>
					<Mui.Grid
						container
						item
						spacing={4}
						direction="row"
						justifyContent="space-between"
					>
						<Mui.Grid item xs={12}>
							<Mui.Grid container direction="column" spacing={10} >
								<Mui.Grid item>
									<Mui.Card>
										<Mui.CardHeader
											title={
												<Mui.Typography variant="h4">{'Geographic Lead Routing'}</Mui.Typography>
												
											}
										/>
											<Mui.CardContent>
												<Mui.Grid container spacing={2} direction="column">
													<Mui.Grid item>
														<Mui.Typography>This is the test for the Geographic Lead Routing</Mui.Typography>
													</Mui.Grid>
												</Mui.Grid>
											</Mui.CardContent>
									</Mui.Card>	
								</Mui.Grid>
								<Mui.Grid item>
									<Mui.Typography>Geographic Routing Rules</Mui.Typography>
									<Mui.Card>
										<Mui.CardHeader
										/>
											<Mui.CardContent>
												<Mui.Grid container spacing={2} direction="column">
													<Mui.Grid item>

														<Mui.Typography>Agent Name</Mui.Typography>
														<span style={{border:'1px solid'}}>X 899282</span>
														<span style={{border:'1px solid'}}>X 9883838</span>
													</Mui.Grid>
												</Mui.Grid>
											</Mui.CardContent>
									</Mui.Card>	
								</Mui.Grid>
								<Mui.Grid item>
									<Mui.Button
										variant="contained"
										color="secondary"
										onClick={() => this.setState({ addAgentIsOpen: true})}
										>
											Add a Geographic Routing Rule
									</Mui.Button>
								</Mui.Grid>
								<Mui.Grid item>
								</Mui.Grid>
							</Mui.Grid>
						</Mui.Grid>
						<SelectAgentDialog
							open={addAgentIsOpen}
							onClose={() => this.setState({ addAgentIsOpen: false })}
							geographicRoute = {goegraphicRoute}
						/>
					</Mui.Grid>
				</Mui.Grid>
		);
	}
}

export const GeographicRoute = Component;